using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Record;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Update;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance;

public static class HiveMaintenanceEndpoints {
    public static IEndpointRouteBuilder
        MapHiveMaintenanceEndpoints(
            this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGroup(
                "/api/hive-actions/hive-maintenance")
            .WithTags(
                "Hive Maintenance")
            .RequireAuthorization()
            .MapRecordHiveMaintenanceEndpoint()
            .MapUpdateHiveMaintenanceEndpoint();

        return endpoints;
    }
}
