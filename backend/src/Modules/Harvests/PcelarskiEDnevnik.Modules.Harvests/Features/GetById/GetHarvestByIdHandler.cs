using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests
    .Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;
using PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetById;

internal sealed class GetHarvestByIdHandler(
    HarvestsDbContext dbContext,
    HarvestSourceSetResolver
        sourceSetResolver) {
    public async Task<GetHarvestByIdResponse?>
        HandleAsync(
            Guid beekeeperId,
            Guid harvestId,
            CancellationToken cancellationToken) {
        var harvest =
            await (
                from item in
                    dbContext.HoneyHarvests
                        .AsNoTracking()

                join batch in
                    dbContext.HoneyBatches
                        .AsNoTracking()
                    on item.HoneyBatchId
                    equals batch.Id

                where
                    item.Id == harvestId
                    &&
                    item.BeekeeperId ==
                    beekeeperId
                    &&
                    batch.OwnerBeekeeperId ==
                    beekeeperId

                select new {
                    Harvest = item,
                    Batch = batch
                })
                .SingleOrDefaultAsync(
                    cancellationToken);

        if (harvest is null) {
            return null;
        }

        var harvestItems =
            await dbContext.HoneyHarvestItems
                .AsNoTracking()
                .Where(
                    x =>
                        x.HoneyHarvestId ==
                        harvestId)
                .OrderBy(x => x.Id)
                .Select(
                    x =>
                        new {
                            x.HiveSuperStayId,
                            x.FramesHarvested
                        })
                .ToListAsync(
                    cancellationToken);

        var sourceIds =
            harvestItems
                .Select(
                    x =>
                        x.HiveSuperStayId)
                .Distinct()
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

        var sources =
            harvestItems
                .Select(
                    x =>
                        HarvestSourceDetailsMapper
                            .Map(
                                x.HiveSuperStayId,
                                x.FramesHarvested,
                                resolvedById))
                .ToList();

        DateOnly? sourceStartedOn =
            sourceSet.Sources.Count == 0
                ? null
                : sourceSet.Sources.Min(
                    x =>
                        x.SuperStay
                            .StartedOn);

        DateOnly? sourceEndedOn =
            sourceSet.Sources.Count == 0
                ? null
                : sourceSet.Sources.Max(
                    x =>
                        x.SuperStay
                            .EndedOn);

        var totalFrames =
            harvestItems.Sum(
                x =>
                    x.FramesHarvested);

        return new GetHarvestByIdResponse(
            harvest.Harvest.Id,
            harvest.Harvest.HarvestedOn,
            harvest.Harvest.HoneyAmount,
            harvest.Harvest.Unit,
            harvest.Harvest.Notes,
            totalFrames,
            harvestItems.Count,
            sourceStartedOn,
            sourceEndedOn,
            new HarvestBatchSummaryResponse(
                harvest.Batch.Id,
                harvest.Batch.BatchCode,
                harvest.Batch.Name,
                harvest.Batch.Status
                    .ToString()),
            sources,
            HarvestSourceDetailsMapper
                .MapIssues(
                    sourceSet.Issues));
    }
}