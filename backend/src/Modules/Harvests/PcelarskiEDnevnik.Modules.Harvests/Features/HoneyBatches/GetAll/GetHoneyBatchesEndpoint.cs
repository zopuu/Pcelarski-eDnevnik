using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetAll;

public static class GetHoneyBatchesEndpoint {
    public static IEndpointRouteBuilder
        MapGetHoneyBatchesEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
                "/",
                HandleAsync)
            .WithName("GetHoneyBatches");

        return endpoints;
    }

    private static async Task<IResult>
        HandleAsync(
            [AsParameters]
            PaginationRequest request,
            ICurrentBeekeeperContext
                currentBeekeeper,
            GetHoneyBatchesHandler handler,
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

        return Results.Ok(response);
    }
}