using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.Hives.Create;
using PcelarskiEDnevnik.Modules.Hives.Features.Hives.GetAll;
using PcelarskiEDnevnik.Modules.Hives.Features.Hives.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.Hives.Update;
using PcelarskiEDnevnik.Modules.Hives.Features.Hives.GetStayHistory;

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
        apiaryHivesGroup.MapGetHivesEndpoint();
        apiaryHivesGroup.MapCreateHiveEndpoint();
        var hivesGroup =
            endpoints
                .MapGroup("/api/hives")
                .WithTags("Hives")
                .RequireAuthorization();

        hivesGroup
            .MapGetHiveByIdEndpoint();

        hivesGroup
            .MapUpdateHiveEndpoint();

        hivesGroup
            .MapGetHiveStayHistoryEndpoint();

        return endpoints;
    }
}
