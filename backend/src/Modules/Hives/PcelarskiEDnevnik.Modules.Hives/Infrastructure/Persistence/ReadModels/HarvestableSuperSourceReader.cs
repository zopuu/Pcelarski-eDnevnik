using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Contracts.Harvesting;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.ReadModels;

internal sealed class HarvestableSuperSourceReader(
    HivesDbContext dbContext)
    : IHarvestableSuperSourceReader {
    public Task<IReadOnlyList<HarvestableSuperStaySource>>
        ReadAsync(
            Guid beekeeperId,
            CancellationToken cancellationToken) {
        return ReadCoreAsync(
            beekeeperId,
            hiveSuperStayIds: null,
            availableOnly: true,
            cancellationToken);
    }

    public Task<IReadOnlyList<HarvestableSuperStaySource>>
        ReadByIdsAsync(
            Guid beekeeperId,
            IReadOnlyCollection<Guid> hiveSuperStayIds,
            CancellationToken cancellationToken) {
        if (hiveSuperStayIds.Count == 0) {
            return Task.FromResult<
                IReadOnlyList<HarvestableSuperStaySource>>(
                []);
        }

        return ReadCoreAsync(
            beekeeperId,
            hiveSuperStayIds,
            availableOnly: false,
            cancellationToken);
    }

    private async Task<
        IReadOnlyList<HarvestableSuperStaySource>>
        ReadCoreAsync(
            Guid beekeeperId,
            IReadOnlyCollection<Guid>? hiveSuperStayIds,
            bool availableOnly,
            CancellationToken cancellationToken) {
        var query =
            from superStay in
                dbContext.HiveSuperStays.AsNoTracking()

            join hiveSuper in
                dbContext.HiveSupers.AsNoTracking()
                on superStay.HiveSuperId
                equals hiveSuper.Id

            join hive in
                dbContext.Hives.AsNoTracking()
                on superStay.HiveId
                equals hive.Id

            where
                hiveSuper.OwnerBeekeeperId ==
                beekeeperId
                &&
                superStay.EndedOn.HasValue
                &&
                superStay.HarvestableFrameCount.HasValue
                &&
                superStay
                    .RemainingHarvestableFrameCount
                    .HasValue

            select new CandidateRow(
                superStay.Id,
                hiveSuper.Id,
                hive.Id,
                hive.Label,
                superStay.StartedOn,
                superStay.EndedOn,
                superStay.HarvestableFrameCount,
                superStay
                    .RemainingHarvestableFrameCount,
                hiveSuper.Status);

        if (availableOnly) {
            query =
                query.Where(
                    x =>
                        x.Status ==
                        HiveSuperStatus.ReadyForHarvest
                        &&
                        x.RemainingHarvestableFrameCount >
                        0);
        }

        if (hiveSuperStayIds is not null) {
            var ids =
                hiveSuperStayIds
                    .Distinct()
                    .ToArray();

            query =
                query.Where(
                    x =>
                        ids.Contains(
                            x.HiveSuperStayId));
        }

        var candidates =
            await query
                .OrderBy(x => x.StartedOn)
                .ThenBy(x => x.EndedOn)
                .ThenBy(x => x.HiveSuperStayId)
                .ToListAsync(
                    cancellationToken);

        if (candidates.Count == 0) {
            return [];
        }

        var hiveIds =
            candidates
                .Select(x => x.HiveId)
                .Distinct()
                .ToArray();

        var earliestDate =
            candidates.Min(
                x => x.StartedOn);

        var latestDate =
            candidates.Max(
                x => x.EndedOn!.Value);

        var rangeStart =
            AtStartOfDayUtc(
                earliestDate);

        var rangeEndExclusive =
            AtStartOfDayUtc(
                latestDate.AddDays(1));

        var hiveStays =
            await dbContext.HiveStays
                .AsNoTracking()
                .Where(
                    x =>
                        hiveIds.Contains(
                            x.HiveId)
                        &&
                        x.StartedAtUtc <
                        rangeEndExclusive
                        &&
                        (
                            x.EndedAtUtc == null
                            ||
                            x.EndedAtUtc >
                            rangeStart
                        ))
                .Select(
                    x =>
                        new HiveStayHarvestSource(
                            x.Id,
                            x.HiveId,
                            x.ApiaryId,
                            x.StartedAtUtc,
                            x.EndedAtUtc))
                .OrderBy(
                    x => x.StartedAtUtc)
                .ThenBy(x => x.Id)
                .ToListAsync(
                    cancellationToken);

        var staysByHive =
            hiveStays
                .GroupBy(x => x.HiveId)
                .ToDictionary(
                    x => x.Key,
                    x =>
                        (IReadOnlyList<
                            HiveStayHarvestSource>)
                        x.ToList());

        return candidates
            .Select(
                candidate => {
                    var endedOn =
                        candidate.EndedOn!.Value;

                    var superStart =
                        AtStartOfDayUtc(
                            candidate.StartedOn);

                    var superEndExclusive =
                        AtStartOfDayUtc(
                            endedOn.AddDays(1));

                    var relevantHiveStays =
                        staysByHive
                            .GetValueOrDefault(
                                candidate.HiveId,
                                [])
                            .Where(
                                x =>
                                    x.StartedAtUtc <
                                    superEndExclusive
                                    &&
                                    (
                                        x.EndedAtUtc ==
                                        null
                                        ||
                                        x.EndedAtUtc >
                                        superStart
                                    ))
                            .ToList();

                    return
                        new HarvestableSuperStaySource(
                            candidate.HiveSuperStayId,
                            candidate.HiveSuperId,
                            candidate.HiveId,
                            candidate.HiveLabel,
                            candidate.StartedOn,
                            endedOn,
                            candidate
                                .HarvestableFrameCount!
                                .Value,
                            candidate
                                .RemainingHarvestableFrameCount!
                                .Value,
                            relevantHiveStays);
                })
            .ToList();
    }

    private static DateTimeOffset
        AtStartOfDayUtc(
            DateOnly date) {
        return new DateTimeOffset(
            date.ToDateTime(
                TimeOnly.MinValue),
            TimeSpan.Zero);
    }

    private sealed record CandidateRow(
        Guid HiveSuperStayId,
        Guid HiveSuperId,
        Guid HiveId,
        string HiveLabel,
        DateOnly StartedOn,
        DateOnly? EndedOn,
        int? HarvestableFrameCount,
        int? RemainingHarvestableFrameCount,
        HiveSuperStatus Status);
}