using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.Record;

namespace PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings;

public static class PattyFeedingEndpoints {
    public static IEndpointRouteBuilder
        MapPattyFeedingEndpoints(
            this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGroup(
                "/api/hive-actions")
            .WithTags(
                "Patty Feedings")
            .RequireAuthorization()
            .MapRecordPattyFeedingEndpoint();

        endpoints
            .MapGroup(
                "/api/hives")
            .WithTags(
                "Patty Feedings")
            .RequireAuthorization()
            .MapGetPattyFeedingByIdEndpoint();

        return endpoints;
    }
}
