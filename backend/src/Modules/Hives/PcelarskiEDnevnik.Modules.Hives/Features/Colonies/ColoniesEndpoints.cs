using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

using PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Create;
using PcelarskiEDnevnik.Modules.Hives.Features.Colonies.CreateWithQueen;
using PcelarskiEDnevnik.Modules.Hives.Features.Colonies.GetCurrentByHive;
using PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Update;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies;

public static class ColoniesEndpoints {
    public static IEndpointRouteBuilder
        MapColoniesEndpoints(
            this IEndpointRouteBuilder endpoints) {
        var hiveColoniesGroup =
            endpoints
                .MapGroup(
                    "/api/hives")
                .WithTags(
                    "Colonies")
                .RequireAuthorization();

        hiveColoniesGroup
            .MapCreateColonyEndpoint();

        hiveColoniesGroup
            .MapGetCurrentColonyByHiveEndpoint();
        hiveColoniesGroup.MapCreateColonyWithQueenEndpoint();

        var coloniesGroup =
            endpoints
                .MapGroup(
                    "/api/colonies")
                .WithTags(
                    "Colonies")
                .RequireAuthorization();

        coloniesGroup
            .MapUpdateColonyEndpoint();

        return endpoints;
    }
}