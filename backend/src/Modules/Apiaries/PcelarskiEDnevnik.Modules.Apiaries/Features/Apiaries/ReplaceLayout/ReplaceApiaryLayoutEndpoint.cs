using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.ReplaceLayout;

public static class ReplaceApiaryLayoutEndpoint {
    public static IEndpointRouteBuilder MapReplaceApiaryLayoutEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut(
            "/{apiaryId:guid}/layout",
            async (
                Guid apiaryId,
                ReplaceApiaryLayoutRequest request,
                ReplaceApiaryLayoutHandler handler,
                CancellationToken cancellationToken) =>
                Results.Ok(await handler.HandleAsync(
                    apiaryId,
                    request,
                    cancellationToken)));

        return endpoints;
    }
}
