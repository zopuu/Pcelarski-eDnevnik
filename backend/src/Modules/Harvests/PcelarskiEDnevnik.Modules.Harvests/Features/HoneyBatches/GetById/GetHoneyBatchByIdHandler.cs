using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests
    .Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;
using PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;

internal sealed class GetHoneyBatchByIdHandler(
    HarvestsDbContext dbContext,
    HarvestSourceSetResolver
        sourceSetResolver) {
    public async Task<
        GetHoneyBatchByIdResponse?>
        HandleAsync(
            Guid beekeeperId,
            Guid batchId,
            CancellationToken cancellationToken) {
        var batch =
            await dbContext.HoneyBatches
                .AsNoTracking()
                .SingleOrDefaultAsync(
                    x =>
                        x.Id == batchId
                        &&
                        x.OwnerBeekeeperId ==
                        beekeeperId,
                    cancellationToken);

        if (batch is null) {
            return null;
        }

        var harvests =
            await dbContext.HoneyHarvests
                .AsNoTracking()
                .Where(
                    x =>
                        x.HoneyBatchId ==
                        batch.Id
                        &&
                        x.BeekeeperId ==
                        beekeeperId)
                .OrderByDescending(
                    x =>
                        x.HarvestedOn)
                .ThenByDescending(
                    x => x.Id)
                .Select(
                    x =>
                        new {
                            x.Id,
                            x.HarvestedOn,
                            x.HoneyAmount,
                            x.Unit
                        })
                .ToListAsync(
                    cancellationToken);

        var harvestIds =
            harvests
                .Select(x => x.Id)
                .ToArray();

        var items =
            harvestIds.Length == 0
                ? []
                : await dbContext
                    .HoneyHarvestItems
                    .AsNoTracking()
                    .Where(
                        x =>
                            harvestIds.Contains(
                                x.HoneyHarvestId))
                    .Select(
                        x =>
                            new {
                                x.HoneyHarvestId,
                                x.HiveSuperStayId,
                                x.FramesHarvested
                            })
                    .ToListAsync(
                        cancellationToken);

        var itemsByHarvest =
            items
                .GroupBy(
                    x =>
                        x.HoneyHarvestId)
                .ToDictionary(
                    x => x.Key,
                    x => x.ToList());

        var harvestResponses =
            harvests
                .Select(
                    harvest => {
                        var harvestItems =
                            itemsByHarvest
                                .GetValueOrDefault(
                                    harvest.Id,
                                    []);

                        return
                            new HoneyBatchHarvestResponse(
                                harvest.Id,
                                harvest.HarvestedOn,
                                harvest.HoneyAmount,
                                harvest.Unit,
                                harvestItems.Sum(
                                    x =>
                                        x.FramesHarvested),
                                harvestItems.Count);
                    })
                .ToList();

        var sourceContributions =
            items
                .GroupBy(
                    x =>
                        x.HiveSuperStayId)
                .Select(
                    group =>
                        new {
                            HiveSuperStayId =
                                group.Key,

                            FramesHarvested =
                                group.Sum(
                                    x =>
                                        x.FramesHarvested)
                        })
                .OrderBy(
                    x =>
                        x.HiveSuperStayId)
                .ToList();

        var sourceIds =
            sourceContributions
                .Select(
                    x =>
                        x.HiveSuperStayId)
                .ToArray();

        var sourceSet =
            await sourceSetResolver
                .ResolveByIdsAsync(
                    beekeeperId,
                    sourceIds,
                    cancellationToken);

        var resolvedById =
            sourceSet.Sources
                .ToDictionary(
                    x =>
                        x.SuperStay
                            .HiveSuperStayId);

        var sourceResponses =
            sourceContributions
                .Select(
                    x =>
                        HarvestSourceDetailsMapper
                            .Map(
                                x.HiveSuperStayId,
                                x.FramesHarvested,
                                resolvedById))
                .ToList();

        var currentComposition =
            await ReadCurrentCompositionAsync(
                batch.Id,
                cancellationToken);

        return new GetHoneyBatchByIdResponse(
            batch.Id,
            batch.Name,
            batch.BatchCode,
            batch.Status.ToString(),
            batch.TotalAmount,
            batch.Unit,
            batch.Notes,
            batch.PeriodStartedOn,
            batch.PeriodEndedOn,
            harvestResponses.Count,
            items.Sum(
                x =>
                    x.FramesHarvested),
            sourceContributions.Count,
            harvestResponses,
            sourceResponses,
            currentComposition,
            HarvestSourceDetailsMapper
                .MapIssues(
                    sourceSet.Issues));
    }

    private async Task<
        HoneyBatchCompositionResponse?>
        ReadCurrentCompositionAsync(
            Guid batchId,
            CancellationToken cancellationToken) {
        var composition =
            await dbContext
                .HoneyBatchCompositions
                .AsNoTracking()
                .Where(
                    x =>
                        x.HoneyBatchId ==
                        batchId)
                .OrderByDescending(
                    x =>
                        x.DeterminedAt)
                .ThenByDescending(
                    x => x.Id)
                .Select(
                    x =>
                        new {
                            x.Id,
                            x.AlgorithmVersion,
                            x.DeterminedAt,
                            x.DeterminationMethod
                        })
                .FirstOrDefaultAsync(
                    cancellationToken);

        if (composition is null) {
            return null;
        }

        var items =
            await dbContext
                .HoneyBatchCompositionItems
                .AsNoTracking()
                .Where(
                    x =>
                        x.HoneyBatchCompositionId ==
                        composition.Id)
                .OrderByDescending(
                    x =>
                        x.Percentage)
                .ThenBy(
                    x =>
                        x.ForageType)
                .Select(
                    x =>
                        new
                            HoneyBatchCompositionItemResponse(
                                x.Id,
                                x.ForageType,
                                x.Percentage,
                                x.Notes))
                .ToListAsync(
                    cancellationToken);

        return new HoneyBatchCompositionResponse(
            composition.Id,
            composition.AlgorithmVersion,
            composition.DeterminedAt,
            composition.DeterminationMethod
                .ToString(),
            items);
    }
}