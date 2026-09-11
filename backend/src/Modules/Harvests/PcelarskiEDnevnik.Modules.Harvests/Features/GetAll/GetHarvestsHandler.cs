using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;
using PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetAll;

internal sealed class GetHarvestsHandler(
    HarvestsDbContext dbContext) {
    public async Task<GetHarvestsResponse>
        HandleAsync(
            Guid beekeeperId,
            PaginationRequest request,
            CancellationToken cancellationToken) {
        var harvestQuery =
            dbContext.HoneyHarvests
                .AsNoTracking()
                .Where(
                    x =>
                        x.BeekeeperId ==
                        beekeeperId);

        var totalCount =
            await harvestQuery.CountAsync(
                cancellationToken);

        var items =
            await (
                from harvest in harvestQuery

                join batch in
                    dbContext.HoneyBatches
                        .AsNoTracking()
                    on harvest.HoneyBatchId
                    equals batch.Id

                where
                    batch.OwnerBeekeeperId ==
                    beekeeperId

                orderby
                    harvest.HarvestedOn descending,
                    harvest.Id descending

                select new HarvestListItemResponse(
                    harvest.Id,
                    harvest.HarvestedOn,
                    harvest.HoneyAmount,
                    harvest.Unit,

                    dbContext.HoneyHarvestItems
                        .Where(
                            item =>
                                item.HoneyHarvestId ==
                                harvest.Id)
                        .Sum(
                            item =>
                                (int?)
                                item.FramesHarvested)
                    ?? 0,

                    dbContext.HoneyHarvestItems
                        .Count(
                            item =>
                                item.HoneyHarvestId ==
                                harvest.Id),

                    batch.Id,
                    batch.BatchCode,
                    batch.Name))
                .Skip(request.Skip)
                .Take(request.PageSize)
                .ToListAsync(
                    cancellationToken);

        return new GetHarvestsResponse(
            new PagedResponse<
                HarvestListItemResponse>(
                    items,
                    request.Page,
                    request.PageSize,
                    totalCount));
    }
}