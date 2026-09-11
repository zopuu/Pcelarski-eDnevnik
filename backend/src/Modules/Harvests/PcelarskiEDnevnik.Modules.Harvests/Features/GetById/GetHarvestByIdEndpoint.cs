using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetById;

public static class GetHarvestByIdEndpoint {
    public static IEndpointRouteBuilder
        MapGetHarvestByIdEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
                "/{harvestId:guid}",
                HandleAsync)
            .WithName("GetHarvestById");

        return endpoints;
    }

    private static async Task<IResult>
        HandleAsync(
            Guid harvestId,
            ICurrentBeekeeperContext
                currentBeekeeper,
            GetHarvestByIdHandler handler,
            CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var response =
            await handler.HandleAsync(
                beekeeperId,
                harvestId,
                cancellationToken);

        return response is null
            ? Results.NotFound()
            : Results.Ok(response);
    }
}