using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetCurrentByColony;

public static class GetCurrentQueenByColonyEndpoint {
    public static RouteGroupBuilder
        MapGetCurrentQueenByColonyEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
            "/{colonyId:guid}/current-queen",
            async (
                Guid colonyId,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var colonyExists =
                        await dbContext.Colonies
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.Id ==
                                    colonyId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    if (!colonyExists) {
                        return Results.NotFound();
                    }

                    var queen =
                        await (
                            from stay
                                in dbContext.QueenStays
                                    .AsNoTracking()

                            join item
                                in dbContext.Queens
                                    .AsNoTracking()
                                on stay.QueenId
                                equals item.Id

                            where
                                stay.ColonyId ==
                                colonyId
                                &&
                                stay.EndedOn ==
                                null
                                &&
                                item.OwnerBeekeeperId ==
                                beekeeperId

                            select
                                new GetCurrentQueenByColonyResponse(
                                    item.Id,
                                    item.MarkingColorHex,
                                    item.Origin,
                                    item.Breeder,
                                    item.Breed,
                                    item.Status,
                                    item.EmergedOn,
                                    item.AcquiredOn,
                                    item.Notes,
                                    stay.Id,
                                    stay.StartedOn,
                                    stay.IntroductionMethod,
                                    stay.IntroductionOutcome,
                                    stay.Notes)
                        )
                        .SingleOrDefaultAsync(
                            cancellationToken);

                    return Results.Ok(
                        queen);
                });

        return group;
    }
}