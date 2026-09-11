using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Calculate;

public static class CalculateHoneyBatchCompositionEndpoint {
    public static IEndpointRouteBuilder MapCalculateHoneyBatchCompositionEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost("/{batchId:guid}/composition/calculate", HandleAsync)
            .WithName("CalculateHoneyBatchComposition");

        return endpoints;
    }

    private static async Task<IResult> HandleAsync(
        Guid batchId,
        ICurrentBeekeeperContext currentBeekeeper,
        CalculateHoneyBatchCompositionHandler handler,
        CancellationToken cancellationToken) {
        var beekeeperId = await currentBeekeeper.GetBeekeeperIdAsync(cancellationToken);
        var result = await handler.HandleAsync(beekeeperId, batchId, cancellationToken);

        if (result.WasNotFound) {
            return Results.NotFound();
        }

        if (result.IsUncalculable) {
            return Results.Problem(
                statusCode: StatusCodes.Status422UnprocessableEntity,
                title: "Composition cannot be calculated.",
                extensions: new Dictionary<string, object?> {
                    ["code"] = "honey_batch_composition.cannot_calculate",
                    ["issues"] = result.Issues
                });
        }

        return Results.Ok(result.Composition);
    }
}
