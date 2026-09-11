using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;
using PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetAll;

internal sealed class GetHoneyBatchesHandler(
    HarvestsDbContext dbContext) {
    public async Task<GetHoneyBatchesResponse>
        HandleAsync(
            Guid beekeeperId,
            PaginationRequest request,
            CancellationToken cancellationToken) {
        var query =
            dbContext.HoneyBatches
                .AsNoTracking()
                .Where(
                    x =>
                        x.OwnerBeekeeperId ==
                        beekeeperId);

        var totalCount =
            await query.CountAsync(
                cancellationToken);

        var items =
            await query
                .Select(
                    batch =>
                        new {
                            Batch = batch,

                            HarvestCount =
                                dbContext.HoneyHarvests
                                    .Count(
                                        harvest =>
                                            harvest
                                                .HoneyBatchId ==
                                            batch.Id),

                            LastHarvestedOn =
                                dbContext.HoneyHarvests
                                    .Where(
                                        harvest =>
                                            harvest
                                                .HoneyBatchId ==
                                            batch.Id)
                                    .Max(
                                        harvest =>
                                            (DateOnly?)
                                            harvest
                                                .HarvestedOn),

                            TotalFrames =
                                (
                                    from harvest
                                        in dbContext
                                            .HoneyHarvests
                                    join item
                                        in dbContext
                                            .HoneyHarvestItems
                                        on harvest.Id
                                        equals item
                                            .HoneyHarvestId
                                    where
                                        harvest
                                            .HoneyBatchId ==
                                        batch.Id
                                    select
                                        (int?)
                                        item
                                            .FramesHarvested
                                )
                                .Sum()
                                ?? 0,

                            HasComposition =
                                dbContext
                                    .HoneyBatchCompositions
                                    .Any(
                                        composition =>
                                            composition
                                                .HoneyBatchId ==
                                            batch.Id)
                        })
                .OrderByDescending(
                    x =>
                        x.LastHarvestedOn)
                .ThenByDescending(
                    x =>
                        x.Batch
                            .PeriodEndedOn)
                .ThenByDescending(
                    x =>
                        x.Batch.Id)
                .Skip(request.Skip)
                .Take(request.PageSize)
                .Select(
                    x =>
                        new HoneyBatchListItemResponse(
                            x.Batch.Id,
                            x.Batch.Name,
                            x.Batch.BatchCode,
                            x.Batch.Status
                                .ToString(),
                            x.Batch.TotalAmount,
                            x.Batch.Unit,
                            x.Batch
                                .PeriodStartedOn,
                            x.Batch
                                .PeriodEndedOn,
                            x.LastHarvestedOn,
                            x.HarvestCount,
                            x.TotalFrames,
                            x.HasComposition))
                .ToListAsync(
                    cancellationToken);

        return new GetHoneyBatchesResponse(
            new PagedResponse<
                HoneyBatchListItemResponse>(
                    items,
                    request.Page,
                    request.PageSize,
                    totalCount));
    }
}