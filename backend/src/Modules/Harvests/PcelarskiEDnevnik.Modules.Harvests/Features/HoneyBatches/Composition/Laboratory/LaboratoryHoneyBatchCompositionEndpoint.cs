using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Laboratory;

public static class LaboratoryHoneyBatchCompositionEndpoint {
    public static IEndpointRouteBuilder MapLaboratoryHoneyBatchCompositionEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut("/{batchId:guid}/composition/laboratory", HandleAsync)
            .WithName("SetLaboratoryHoneyBatchComposition");

        return endpoints;
    }

    private static async Task<IResult> HandleAsync(
        Guid batchId,
        LaboratoryHoneyBatchCompositionRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        LaboratoryHoneyBatchCompositionHandler handler,
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
