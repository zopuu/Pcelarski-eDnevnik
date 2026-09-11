using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;

public static class GetHoneyBatchByIdEndpoint {
    public static IEndpointRouteBuilder
        MapGetHoneyBatchByIdEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
                "/{batchId:guid}",
                HandleAsync)
            .WithName("GetHoneyBatchById");

        return endpoints;
    }

    private static async Task<IResult>
        HandleAsync(
            Guid batchId,
            ICurrentBeekeeperContext
                currentBeekeeper,
            GetHoneyBatchByIdHandler handler,
            CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var response =
            await handler.HandleAsync(
                beekeeperId,
                batchId,
                cancellationToken);

        return response is null
            ? Results.NotFound()
            : Results.Ok(response);
    }
}