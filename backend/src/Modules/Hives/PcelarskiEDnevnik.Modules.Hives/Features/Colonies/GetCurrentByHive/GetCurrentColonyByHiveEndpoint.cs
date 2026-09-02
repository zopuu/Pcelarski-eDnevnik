using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.GetCurrentByHive;

public static class GetCurrentColonyByHiveEndpoint {
    public static RouteGroupBuilder
        MapGetCurrentColonyByHiveEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
            "/{hiveId:guid}/current-colony",
            async (
                Guid hiveId,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var hiveExists =
                        await dbContext.Hives
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.Id == hiveId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    if (!hiveExists) {
                        return Results.NotFound();
                    }

                    var colony =
                        await (
                            from stay
                                in dbContext.ColonyStays
                                    .AsNoTracking()

                            join item
                                in dbContext.Colonies
                                    .AsNoTracking()
                                on stay.ColonyId
                                equals item.Id

                            where
                                stay.HiveId == hiveId &&
                                stay.EndedOn == null &&
                                item.OwnerBeekeeperId ==
                                beekeeperId

                            select
                                new GetCurrentColonyByHiveResponse(
                                    item.Id,
                                    item.Origin,
                                    item.Status,
                                    item.FormedOn,
                                    item.Notes,
                                    stay.Id,
                                    stay.StartedOn,
                                    stay.Notes)
                        )
                        .SingleOrDefaultAsync(
                            cancellationToken);

                    return Results.Ok(
                        colony);
                });

        return group;
    }
}