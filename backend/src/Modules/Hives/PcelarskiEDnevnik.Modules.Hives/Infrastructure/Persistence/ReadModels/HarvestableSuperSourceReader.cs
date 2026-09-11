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
                dbContext.HiveSuperStays
                    .AsNoTracking()

            join hiveSuper in
                dbContext.HiveSupers
                    .AsNoTracking()
                on superStay.HiveSuperId
                equals hiveSuper.Id

            join hive in
                dbContext.Hives
                    .AsNoTracking()
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

            select new {
                SuperStay = superStay,
                HiveSuper = hiveSuper,
                Hive = hive
            };

        if (availableOnly) {
            query =
                query.Where(
                    x =>
                        x.HiveSuper.Status ==
                        HiveSuperStatus.ReadyForHarvest
                        &&
                        x.SuperStay
                            .RemainingHarvestableFrameCount!
                            .Value > 0);
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
                            x.SuperStay.Id));
        }

        var candidateRows =
    await query
        .OrderBy(
            x => x.SuperStay.StartedOn)
        .ThenBy(
            x => x.SuperStay.EndedOn)
        .ThenBy(
            x => x.SuperStay.Id)
        .Select(
            x => new {
                HiveSuperStayId =
                    x.SuperStay.Id,

                HiveSuperId =
                    x.HiveSuper.Id,

                HiveId =
                    x.Hive.Id,

                HiveLabel =
                    x.Hive.Label,

                StartedOn =
                    x.SuperStay.StartedOn,

                EndedOn =
                    x.SuperStay.EndedOn,

                HarvestableFrameCount =
                    x.SuperStay
                        .HarvestableFrameCount,

                RemainingHarvestableFrameCount =
                    x.SuperStay
                        .RemainingHarvestableFrameCount,

                Status =
                    x.HiveSuper.Status
            })
        .ToListAsync(
            cancellationToken);

        var candidates =
            candidateRows
                .Select(
                    x =>
                        new CandidateRow(
                            x.HiveSuperStayId,
                            x.HiveSuperId,
                            x.HiveId,
                            x.HiveLabel,
                            x.StartedOn,
                            x.EndedOn,
                            x.HarvestableFrameCount,
                            x.RemainingHarvestableFrameCount,
                            x.Status))
                .ToList();

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

        var hiveStayRows =
    await dbContext.HiveStays
        .AsNoTracking()
        .Where(
            x =>
                hiveIds.Contains(x.HiveId)
                &&
                x.StartedAtUtc < rangeEndExclusive
                &&
                (
                    x.EndedAtUtc == null
                    ||
                    x.EndedAtUtc > rangeStart
                ))
        .OrderBy(x => x.StartedAtUtc)
        .ThenBy(x => x.Id)
        .Select(
            x => new {
                x.Id,
                x.HiveId,
                x.ApiaryId,
                x.StartedAtUtc,
                x.EndedAtUtc
            })
        .ToListAsync(
            cancellationToken);

        var hiveStays =
            hiveStayRows
                .Select(
                    x =>
                        new HiveStayHarvestSource(
                            x.Id,
                            x.HiveId,
                            x.ApiaryId,
                            x.StartedAtUtc,
                            x.EndedAtUtc))
                .ToList();

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