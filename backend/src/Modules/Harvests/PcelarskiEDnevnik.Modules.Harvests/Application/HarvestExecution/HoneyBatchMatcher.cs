using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Harvests.Domain;
using PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestExecution;

internal sealed class HoneyBatchMatcher(
    HarvestsDbContext dbContext,
    HarvestSourceSetResolver sourceSetResolver,
    HarvestSourceCompatibility compatibility) {
    public async Task<HoneyBatch?>
        FindCompatibleOpenBatchAsync(
            Guid beekeeperId,
            IReadOnlyCollection<Guid>
                newSourceIds,
            string unit,
            CancellationToken cancellationToken) {
        if (newSourceIds.Count == 0) {
            throw new ArgumentException(
                "At least one harvest source is required.",
                nameof(newSourceIds));
        }

        var batches =
            await dbContext.HoneyBatches
                .Where(
                    x =>
                        x.OwnerBeekeeperId ==
                        beekeeperId
                        &&
                        x.Status ==
                        HoneyBatchStatus.Open
                        &&
                        x.Unit == unit)
                .OrderByDescending(
                    x => x.PeriodEndedOn)
                .ThenByDescending(
                    x => x.PeriodStartedOn)
                .ThenBy(x => x.Id)
                .ToListAsync(
                    cancellationToken);

        if (batches.Count == 0) {
            return null;
        }

        var batchIds =
            batches
                .Select(x => x.Id)
                .ToArray();

        var sourceLinks =
            await (
                from harvest in
                    dbContext.HoneyHarvests
                        .AsNoTracking()

                join item in
                    dbContext.HoneyHarvestItems
                        .AsNoTracking()
                    on harvest.Id
                    equals item.HoneyHarvestId

                where
                    batchIds.Contains(
                        harvest.HoneyBatchId)

                select new {
                    harvest.HoneyBatchId,
                    item.HiveSuperStayId
                })
                .Distinct()
                .ToListAsync(
                    cancellationToken);

        var existingIdsByBatch =
            sourceLinks
                .GroupBy(
                    x => x.HoneyBatchId)
                .ToDictionary(
                    x => x.Key,
                    x =>
                        x.Select(
                                y =>
                                    y.HiveSuperStayId)
                            .Distinct()
                            .ToArray());

        var allSourceIds =
            newSourceIds
                .Concat(
                    sourceLinks.Select(
                        x =>
                            x.HiveSuperStayId))
                .Distinct()
                .ToArray();

        var sourceSet =
            await sourceSetResolver
                .ResolveByIdsAsync(
                    beekeeperId,
                    allSourceIds,
                    cancellationToken);

        var sourcesById =
            sourceSet.Sources
                .ToDictionary(
                    x =>
                        x.SuperStay
                            .HiveSuperStayId);

        foreach (var batch in batches) {
            if (!existingIdsByBatch.TryGetValue(
                    batch.Id,
                    out var existingIds)
                ||
                existingIds.Length == 0) {
                continue;
            }

            var combinedIds =
                newSourceIds
                    .Concat(existingIds)
                    .Distinct()
                    .ToArray();

            var combinedSources =
                new List<ResolvedHarvestSource>(
                    combinedIds.Length);

            var complete =
                true;

            foreach (var sourceId in combinedIds) {
                if (!sourcesById.TryGetValue(
                        sourceId,
                        out var source)) {
                    complete = false;
                    break;
                }

                combinedSources.Add(
                    source);
            }

            if (!complete) {
                continue;
            }

            if (compatibility.AreAllCompatible(
                    combinedSources,
                    sourceSet.Index)) {
                return batch;
            }
        }

        return null;
    }
}