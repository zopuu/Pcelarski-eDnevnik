using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.Create;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.Delete;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.GetCurrent;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.Update;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles;

public static class ForageProfilesEndpoints {
    public static IEndpointRouteBuilder MapForageProfilesEndpoints(
        this IEndpointRouteBuilder endpoints) {
        var group = endpoints
            .MapGroup("/{apiaryId:guid}/forage-profile")
            .WithTags("Forage Profiles");

        group.MapCreateForageProfileEndpoint();
        group.MapGetCurrentForageProfileEndpoint();
        group.MapUpdateForageProfileEndpoint();
        group.MapDeleteForageProfileEndpoint();

        return endpoints;
    }
}
