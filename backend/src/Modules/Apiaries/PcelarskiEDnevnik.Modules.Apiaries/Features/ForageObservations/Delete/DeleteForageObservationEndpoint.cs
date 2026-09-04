using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries
    .Features.ForageObservations.Delete;

public static class DeleteForageObservationEndpoint {
    public static IEndpointRouteBuilder
        MapDeleteForageObservationEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapDelete(
            "/{observationId:guid}",
            async (
                Guid observationId,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var observation =
                        await dbContext.ForageObservations
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == observationId &&
                                    x.ObservedByBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    if (observation is null) {
                        return Results.NotFound();
                    }

                    var location =
                        await dbContext.Locations
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == observation.LocationId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    dbContext.ForageObservations.Remove(observation);

                    if (location is not null) {
                        var locationIsShared =
                            await dbContext.ForageObservations
                                .AnyAsync(
                                    x =>
                                        x.LocationId ==
                                        location.Id &&
                                        x.Id != observation.Id,
                                    cancellationToken)
                            ||
                            await dbContext.ApiaryStays
                                .AnyAsync(
                                    x =>
                                        x.LocationId ==
                                        location.Id,
                                    cancellationToken);

                        if (!locationIsShared) {
                            dbContext.Locations.Remove(location);
                        }
                    }

                    await dbContext.SaveChangesAsync(
                        cancellationToken);

                    return Results.NoContent();
                });

        return endpoints;
    }
}
