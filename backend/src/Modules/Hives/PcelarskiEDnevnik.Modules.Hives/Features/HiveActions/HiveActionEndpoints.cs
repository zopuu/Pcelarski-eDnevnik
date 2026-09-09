using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveActions;

public static class HiveActionEndpoints {
    public static IEndpointRouteBuilder
        MapHiveActionEndpoints(
            this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGroup(
                "/api/hives")
            .WithTags(
                "Hive Actions")
            .RequireAuthorization()
            .MapGetHiveActionHistoryEndpoint();

        return endpoints;
    }
}
