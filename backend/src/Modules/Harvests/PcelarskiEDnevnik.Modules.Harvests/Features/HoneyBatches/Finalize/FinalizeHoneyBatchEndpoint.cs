using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Finalize;

public static class FinalizeHoneyBatchEndpoint {
    public static IEndpointRouteBuilder
        MapFinalizeHoneyBatchEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
                "/{batchId:guid}/finalize",
                HandleAsync)
            .WithName("FinalizeHoneyBatch");

        return endpoints;
    }

    private static async Task<IResult>
        HandleAsync(
            Guid batchId,
            ICurrentBeekeeperContext
                currentBeekeeper,
            FinalizeHoneyBatchHandler handler,
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
