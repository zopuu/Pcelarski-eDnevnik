using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Harvests.Features.Create;
using PcelarskiEDnevnik.Modules.Harvests.Features.GetAll;
using PcelarskiEDnevnik.Modules.Harvests.Features.GetAvailableGroups;
using PcelarskiEDnevnik.Modules.Harvests.Features.GetById;

namespace PcelarskiEDnevnik.Modules.Harvests.Features;

public static class HarvestsEndpoints {
    public static IEndpointRouteBuilder
        MapHarvestsEndpoints(
            this IEndpointRouteBuilder endpoints) {
        var group =
            endpoints
                .MapGroup("/api/harvests")
                .WithTags("Harvests")
                .RequireAuthorization();

        group.MapGetAvailableHarvestGroupsEndpoint();
        group.MapCreateHarvestEndpoint();
        
        group.MapGetHarvestsEndpoint();
        group.MapGetHarvestByIdEndpoint();

        return endpoints;
    }
}