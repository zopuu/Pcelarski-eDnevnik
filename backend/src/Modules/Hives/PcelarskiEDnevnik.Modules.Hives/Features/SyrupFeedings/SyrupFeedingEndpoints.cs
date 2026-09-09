using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.GetFeedingOptions;
using PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.Record;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings;

public static class SyrupFeedingEndpoints {
    public static IEndpointRouteBuilder
        MapSyrupFeedingEndpoints(
            this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGroup(
                "/api/hive-actions")
            .WithTags(
                "Syrup Feedings")
            .RequireAuthorization()
            .MapRecordSyrupFeedingEndpoint();

        endpoints
            .MapGroup(
                "/api/apiaries/{apiaryId:guid}/hives")
            .WithTags(
                "Syrup Feedings")
            .RequireAuthorization()
            .MapGetSyrupFeedingOptionsEndpoint();

        endpoints
            .MapGroup(
                "/api/hives")
            .WithTags(
                "Syrup Feedings")
            .RequireAuthorization()
            .MapGetSyrupFeedingByIdEndpoint();

        return endpoints;
    }
}
