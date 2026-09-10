using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Contracts.Harvesting;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.ReadModels;

internal sealed class HarvestableSuperSourceReader(
    HivesDbContext dbContext)
    : IHarvestableSuperSourceReader {
    public async Task<IReadOnlyList<HarvestableSuperStaySource>>
        ReadAsync(
            Guid beekeeperId,
            CancellationToken cancellationToken) {
        var candidates =
            await (
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
                    hiveSuper.Status ==
                    HiveSuperStatus.ReadyForHarvest
                    &&
                    superStay.EndedOn.HasValue
                    &&
                    superStay.HarvestableFrameCount.HasValue
                    &&
                    superStay.RemainingHarvestableFrameCount
                        .HasValue
                    &&
                    superStay.RemainingHarvestableFrameCount
                        .Value > 0

                select new {
                    HiveSuperStayId =
                        superStay.Id,

                    HiveSuperId =
                        hiveSuper.Id,

                    HiveId =
                        hive.Id,

                    HiveLabel =
                        hive.Label,

                    StartedOn =
                        superStay.StartedOn,

                    EndedOn =
                        superStay.EndedOn!.Value,

                    HarvestableFrameCount =
                        superStay.HarvestableFrameCount!
                            .Value,

                    RemainingHarvestableFrameCount =
                        superStay
                            .RemainingHarvestableFrameCount!
                            .Value
                })
                .OrderBy(x => x.StartedOn)
                .ThenBy(x => x.EndedOn)
                .ThenBy(x => x.HiveSuperStayId)
                .ToListAsync(cancellationToken);

        if (candidates.Count == 0) {
            return [];
        }

        var hiveIds =
            candidates
                .Select(x => x.HiveId)
                .Distinct()
                .ToArray();

        var earliestDate =
            candidates.Min(x => x.StartedOn);

        var latestDate =
            candidates.Max(x => x.EndedOn);

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
                        hiveIds.Contains(x.HiveId)
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
                .OrderBy(x => x.StartedAtUtc)
                .ThenBy(x => x.Id)
                .ToListAsync(
                    cancellationToken);

        var staysByHive =
            hiveStays
                .GroupBy(x => x.HiveId)
                .ToDictionary(
                    x => x.Key,
                    x =>
                        (IReadOnlyList<HiveStayHarvestSource>)
                        x.ToList());

        return candidates
            .Select(
                candidate => {
                    var superStart =
                        AtStartOfDayUtc(
                            candidate.StartedOn);

                    var superEndExclusive =
                        AtStartOfDayUtc(
                            candidate.EndedOn
                                .AddDays(1));

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

                    return new HarvestableSuperStaySource(
                        candidate.HiveSuperStayId,
                        candidate.HiveSuperId,
                        candidate.HiveId,
                        candidate.HiveLabel,
                        candidate.StartedOn,
                        candidate.EndedOn,
                        candidate.HarvestableFrameCount,
                        candidate
                            .RemainingHarvestableFrameCount,
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
}