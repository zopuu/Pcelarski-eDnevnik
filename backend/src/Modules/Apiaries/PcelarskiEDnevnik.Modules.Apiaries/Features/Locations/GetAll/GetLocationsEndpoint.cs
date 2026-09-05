using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetAll;

public static class GetLocationsEndpoint {
    public static IEndpointRouteBuilder MapGetLocationsEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/",
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
                                x =>
                                    x.OwnerBeekeeperId ==
                                    beekeeperId)
                            .OrderByDescending(
                                x => x.CreatedAtUtc)
                            .Select(
                                x =>
                                    new LocationListItemResponse(
                                        x.Id,
                                        x.Name,
                                        x.Latitude,
                                        x.Longitude,
                                        x.AltitudeMeters,
                                        x.CadastralParcelNumber,
                                        x.Description))
                            .ToListAsync(
                                cancellationToken);

                    return Results.Ok(locations);
                });

        return endpoints;
    }
}
