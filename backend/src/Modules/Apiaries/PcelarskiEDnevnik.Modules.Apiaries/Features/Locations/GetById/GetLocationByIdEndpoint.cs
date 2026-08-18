using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetById;

public static class GetLocationByIdEndpoint {
    public static IEndpointRouteBuilder MapGetLocationByIdEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
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
                            .AsNoTracking()
                            .Where(
                                x =>
                                    x.Id == id &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId)
                            .Select(
                                x =>
                                    new GetLocationByIdResponse(
                                        x.Id,
                                        x.Name,
                                        x.Latitude,
                                        x.Longitude,
                                        x.AltitudeMeters,
                                        x.CadastralParcelNumber,
                                        x.Description,
                                        x.CreatedAtUtc,
                                        x.UpdatedAtUtc))
                            .SingleOrDefaultAsync(
                                cancellationToken);

                    if (location is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(location);
                });

        return endpoints;
    }
}