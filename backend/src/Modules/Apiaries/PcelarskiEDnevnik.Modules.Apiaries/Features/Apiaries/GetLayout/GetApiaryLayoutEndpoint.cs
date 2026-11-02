using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetLayout;

public static class GetApiaryLayoutEndpoint {
    public static IEndpointRouteBuilder MapGetApiaryLayoutEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/{apiaryId:guid}/layout",
            async (
                Guid apiaryId,
                GetApiaryLayoutHandler handler,
                CancellationToken cancellationToken) =>
                Results.Ok(await handler.HandleAsync(
                    apiaryId,
                    cancellationToken)));

        return endpoints;
    }
}
