using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using PcelarskiEDnevnik.Modules.Hives.Features.Hives.Create;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives;

public static class HivesEndpoints {
    public static IEndpointRouteBuilder MapHivesEndpoints(
        this IEndpointRouteBuilder endpoints) {
        var apiaryHivesGroup =
            endpoints
                .MapGroup(
                    "/api/apiaries/{apiaryId:guid}/hives")
                .WithTags("Hives")
                .RequireAuthorization();

        apiaryHivesGroup
            .MapCreateHiveEndpoint();

        return endpoints;
    }
}