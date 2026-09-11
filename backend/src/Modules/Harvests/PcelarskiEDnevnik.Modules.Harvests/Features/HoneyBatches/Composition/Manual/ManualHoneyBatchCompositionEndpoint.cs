using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Manual;

public static class ManualHoneyBatchCompositionEndpoint {
    public static IEndpointRouteBuilder MapManualHoneyBatchCompositionEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut("/{batchId:guid}/composition/manual", HandleAsync)
            .WithName("SetManualHoneyBatchComposition");

        return endpoints;
    }

    private static async Task<IResult> HandleAsync(
        Guid batchId,
        ManualHoneyBatchCompositionRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        ManualHoneyBatchCompositionHandler handler,
        CancellationToken cancellationToken) {
        var validationErrors = CompositionRequestValidation.ValidateItems(request.Items);

        if (validationErrors is not null) {
            return Results.ValidationProblem(validationErrors);
        }

        var beekeeperId = await currentBeekeeper.GetBeekeeperIdAsync(cancellationToken);
        var response = await handler.HandleAsync(
            beekeeperId,
            batchId,
            request,
            cancellationToken);

        return response is null ? Results.NotFound() : Results.Ok(response);
    }
}
