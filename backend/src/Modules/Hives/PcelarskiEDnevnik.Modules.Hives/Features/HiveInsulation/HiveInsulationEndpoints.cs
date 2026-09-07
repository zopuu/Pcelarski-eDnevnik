using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.GetCurrent;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.Record;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation;

public static class HiveInsulationEndpoints {
    public static IEndpointRouteBuilder
        MapHiveInsulationEndpoints(
            this IEndpointRouteBuilder endpoints) {
        var actionsGroup =
            endpoints
                .MapGroup(
                    "/api/hive-actions")
                .WithTags(
                    "Hive Insulation")
                .RequireAuthorization();

        actionsGroup
            .MapRecordHiveInsulationEndpoint();

        var hivesGroup =
            endpoints
                .MapGroup(
                    "/api/hives")
                .WithTags(
                    "Hive Insulation")
                .RequireAuthorization();

        hivesGroup
            .MapGetCurrentHiveInsulationEndpoint();

        return endpoints;
    }
}
