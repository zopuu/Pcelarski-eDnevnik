using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using PcelarskiEDnevnik.Modules.Relocations.Features.GetByApiary;
using PcelarskiEDnevnik.Modules.Relocations.Features.GetById;

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
        group.MapGetApiaryRelocationsEndpoint();
        group.MapGetRelocationByIdEndpoint();

        return endpoints;
    }
}
