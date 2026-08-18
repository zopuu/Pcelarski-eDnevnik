using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Delete;

public static class DeleteLocationEndpoint {
    public static IEndpointRouteBuilder MapDeleteLocationEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapDelete(
            "/{id:guid}",
            async (
                Guid id,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var location =
                        await dbContext.Locations
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == id &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    if (location is null) {
                        return Results.NotFound();
                    }

                    var inUse =
                        await dbContext.ApiaryStays
                            .AnyAsync(
                                x =>
                                    x.LocationId ==
                                    location.Id,
                                cancellationToken);

                    if (inUse) {
                        throw new ConflictException(
                            "locations.location_in_use",
                            "The location cannot be deleted because it is used by one or more apiary stays.");
                    }

                    dbContext.Locations.Remove(location);

                    try {
                        await dbContext.SaveChangesAsync(
                            cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (
                            LocationPersistenceErrors
                                .IsLocationInUseViolation(
                                    exception)) {
                        throw new ConflictException(
                            "locations.location_in_use",
                            "The location cannot be deleted because it is used by one or more apiary stays.",
                            exception);
                    }

                    return Results.NoContent();
                });

        return endpoints;
    }
}