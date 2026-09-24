using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Deactivate;

public static class DeactivateApiaryEndpoint {
    public static IEndpointRouteBuilder MapDeactivateApiaryEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/{id:guid}/deactivate",
            async (
                Guid id,
                DeactivateApiaryHandler handler,
                CancellationToken cancellationToken) => {
                    var result =
                        await handler.HandleAsync(
                            new DeactivateApiaryCommand(id),
                            cancellationToken);

                    if (result is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(result);
                });

        return endpoints;
    }
}
