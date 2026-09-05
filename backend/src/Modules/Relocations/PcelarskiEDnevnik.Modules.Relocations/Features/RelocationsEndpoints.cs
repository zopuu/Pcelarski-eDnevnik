using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;

public static class RelocationsEndpoints {
    public static IEndpointRouteBuilder
        MapRelocationsEndpoints(
            this IEndpointRouteBuilder endpoints) {
        var group =
            endpoints
                .MapGroup("/api/relocations")
                .WithTags("Relocations")
                .RequireAuthorization();

        group.MapCreateRelocationEndpoint();

        return endpoints;
    }
}