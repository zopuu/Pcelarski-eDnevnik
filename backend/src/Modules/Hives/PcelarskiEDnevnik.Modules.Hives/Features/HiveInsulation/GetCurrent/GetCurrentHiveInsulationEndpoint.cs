using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.GetCurrent;

public static class GetCurrentHiveInsulationEndpoint {
    public static RouteGroupBuilder
        MapGetCurrentHiveInsulationEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/insulation/current",
                async (
                    Guid hiveId,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var states =
                        await HiveInsulationStateReader
                            .ReadOwnedAsync(
                                dbContext,
                                beekeeperId,
                                [hiveId],
                                asOf: null,
                                cancellationToken);

                    var state =
                        states.SingleOrDefault();

                    if (state is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(
                        new GetCurrentHiveInsulationResponse(
                            state.Paper,
                            state.Eps,
                            state.Xps));
                })
            .WithName(
                "GetCurrentHiveInsulation")
            .Produces<GetCurrentHiveInsulationResponse>(
                StatusCodes.Status200OK)
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }
}
