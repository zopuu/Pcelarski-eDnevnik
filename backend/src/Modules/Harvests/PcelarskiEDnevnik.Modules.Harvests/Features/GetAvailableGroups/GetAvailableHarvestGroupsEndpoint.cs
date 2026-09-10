using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetAvailableGroups;

public static class
    GetAvailableHarvestGroupsEndpoint {
    public static IEndpointRouteBuilder
        MapGetAvailableHarvestGroupsEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/available-groups",
            HandleAsync);

        return endpoints;
    }

    internal static async Task<IResult>
        HandleAsync(
            ICurrentBeekeeperContext
                currentBeekeeper,
            GetAvailableHarvestGroupsHandler
                handler,
            CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var response =
            await handler.HandleAsync(
                beekeeperId,
                cancellationToken);

        return Results.Ok(
            response);
    }
}