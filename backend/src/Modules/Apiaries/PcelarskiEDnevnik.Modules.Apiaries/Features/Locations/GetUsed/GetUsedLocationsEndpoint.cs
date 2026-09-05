using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetAll;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetUsed;

public static class GetUsedLocationsEndpoint {
    public static IEndpointRouteBuilder
        MapGetUsedLocationsEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/used",
            async (
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var locations =
                        await dbContext.Locations
                            .AsNoTracking()
                            .Where(
                                location =>
                                    location.OwnerBeekeeperId ==
                                    beekeeperId)
                            .Where(
                                location =>
                                    dbContext.ApiaryStays
                                        .Any(
                                            stay =>
                                                stay.LocationId ==
                                                location.Id))
                            .OrderBy(
                                location =>
                                    location.Name)
                            .ThenBy(
                                location =>
                                    location.Id)
                            .Select(
                                location =>
                                    new LocationListItemResponse(
                                        location.Id,
                                        location.Name,
                                        location.Latitude,
                                        location.Longitude,
                                        location.AltitudeMeters,
                                        location.CadastralParcelNumber))
                            .ToListAsync(
                                cancellationToken);

                    return Results.Ok(locations);
                });

        return endpoints;
    }
}
