using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings.Record;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings;

public static class HoneyFrameFeedingEndpoints {
    public static IEndpointRouteBuilder
        MapHoneyFrameFeedingEndpoints(
            this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGroup(
                "/api/hive-actions")
            .WithTags(
                "Honey Frame Feedings")
            .RequireAuthorization()
            .MapRecordHoneyFrameFeedingEndpoint();

        endpoints
            .MapGroup(
                "/api/hives")
            .WithTags(
                "Honey Frame Feedings")
            .RequireAuthorization()
            .MapGetHoneyFrameFeedingByIdEndpoint();

        return endpoints;
    }
}
