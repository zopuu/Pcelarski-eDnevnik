using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Update;

public static class UpdateLocationEndpoint {
    public static IEndpointRouteBuilder MapUpdateLocationEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut(
            "/{id:guid}",
            async (
                Guid id,
                UpdateLocationRequest request,
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

                    location.Update(
                        request.Name,
                        request.Latitude!.Value,
                        request.Longitude!.Value,
                        request.AltitudeMeters,
                        request.CadastralParcelNumber,
                        request.Description);

                    await dbContext.SaveChangesAsync(
                        cancellationToken);

                    var response =
                        new UpdateLocationResponse(
                            location.Id,
                            location.Name,
                            location.Latitude,
                            location.Longitude,
                            location.AltitudeMeters,
                            location.CadastralParcelNumber,
                            location.Description,
                            location.CreatedAtUtc,
                            location.UpdatedAtUtc);

                    return Results.Ok(response);
                });

        return endpoints;
    }
}