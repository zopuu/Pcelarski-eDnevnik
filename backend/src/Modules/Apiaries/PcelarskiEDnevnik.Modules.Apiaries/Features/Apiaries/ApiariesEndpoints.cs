using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetAll;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries;

public static class ApiariesEndpoints {
    public static IEndpointRouteBuilder MapApiariesEndpoints(
        this IEndpointRouteBuilder endpoints) {
        var group = endpoints
            .MapGroup("/api/apiaries")
            .WithTags("Apiaries")
            .RequireAuthorization();

        group.MapCreateApiaryEndpoint();
        group.MapGetApiariesEndpoint();

        return endpoints;
    }
}