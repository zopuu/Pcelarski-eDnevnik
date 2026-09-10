using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.Create;

public static class CreateHarvestEndpoint {
    public static IEndpointRouteBuilder
        MapCreateHarvestEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            HandleAsync);

        return endpoints;
    }

    private static async Task<IResult>
        HandleAsync(
            CreateHarvestRequest request,
            ICurrentBeekeeperContext
                currentBeekeeper,
            CreateHarvestHandler handler,
            CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var response =
            await handler.HandleAsync(
                beekeeperId,
                request,
                cancellationToken);

        return Results.Created(
            $"/api/harvests/{response.HarvestId}",
            response);
    }
}