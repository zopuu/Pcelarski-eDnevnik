using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

using PcelarskiEDnevnik.Modules.Hives.Features.Queens.Create;
using PcelarskiEDnevnik.Modules.Hives.Features.Queens.Change;
using PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetAvailable;
using PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetCurrentByColony;
using PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetStays;
using PcelarskiEDnevnik.Modules.Hives.Features.Queens.Update;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens;

public static class QueensEndpoints {
    public static IEndpointRouteBuilder
        MapQueensEndpoints(
            this IEndpointRouteBuilder endpoints) {
        var colonyQueensGroup =
            endpoints
                .MapGroup(
                    "/api/colonies")
                .WithTags(
                    "Queens")
                .RequireAuthorization();

        colonyQueensGroup
            .MapCreateQueenEndpoint();

        colonyQueensGroup
            .MapGetCurrentQueenByColonyEndpoint();

        colonyQueensGroup
            .MapChangeQueenEndpoint();

        var queensGroup =
            endpoints
                .MapGroup(
                    "/api/queens")
                .WithTags(
                    "Queens")
                .RequireAuthorization();

        queensGroup
            .MapUpdateQueenEndpoint();

        queensGroup
            .MapGetQueenStaysEndpoint();

        queensGroup
            .MapGetAvailableQueensEndpoint();

        return endpoints;
    }
}
