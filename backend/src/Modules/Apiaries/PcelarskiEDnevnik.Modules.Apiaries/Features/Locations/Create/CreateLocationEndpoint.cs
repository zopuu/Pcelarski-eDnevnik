using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Create;

public static class CreateLocationEndpoint {
    public static IEndpointRouteBuilder MapCreateLocationEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            async (
                CreateLocationRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var location =
                        ApiaryLocation.Create(
                            beekeeperId,
                            request.Name,
                            request.Latitude!.Value,
                            request.Longitude!.Value,
                            request.AltitudeMeters,
                            request.CadastralParcelNumber,
                            request.Description);

                    dbContext.Locations.Add(location);

                    await dbContext.SaveChangesAsync(
                        cancellationToken);

                    var response =
                        new CreateLocationResponse(
                            location.Id,
                            location.Name,
                            location.Latitude,
                            location.Longitude,
                            location.AltitudeMeters,
                            location.CadastralParcelNumber,
                            location.Description,
                            location.CreatedAtUtc);

                    return Results.Created(
                        $"/api/locations/{location.Id}",
                        response);
                });

        return endpoints;
    }
}