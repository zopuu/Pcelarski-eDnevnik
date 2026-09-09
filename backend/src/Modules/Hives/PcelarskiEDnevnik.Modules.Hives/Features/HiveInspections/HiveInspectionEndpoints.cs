using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections.Record;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections;

public static class HiveInspectionEndpoints {
    public static IEndpointRouteBuilder MapHiveInspectionEndpoints(
        this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGroup("/api/hives")
            .WithTags("Hive Inspections")
            .RequireAuthorization()
            .MapRecordHiveInspectionEndpoint();

        return endpoints;
    }
}
