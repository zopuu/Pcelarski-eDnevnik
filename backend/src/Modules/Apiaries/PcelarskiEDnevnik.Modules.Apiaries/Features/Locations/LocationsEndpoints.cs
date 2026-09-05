using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Create;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Delete;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetAll;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetById;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetUsed;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Update;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations;

public static class LocationsEndpoints {
    public static IEndpointRouteBuilder MapLocationsEndpoints(
        this IEndpointRouteBuilder endpoints) {
        var group =
            endpoints
                .MapGroup("/api/locations")
                .WithTags("Locations")
                .RequireAuthorization();

        group.MapCreateLocationEndpoint();
        group.MapGetLocationsEndpoint();
        group.MapGetUsedLocationsEndpoint();
        group.MapGetLocationByIdEndpoint();
        group.MapUpdateLocationEndpoint();
        group.MapDeleteLocationEndpoint();

        return endpoints;
    }
}
