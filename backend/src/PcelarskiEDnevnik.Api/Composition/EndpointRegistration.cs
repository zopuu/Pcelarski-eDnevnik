using PcelarskiEDnevnik.Api.Features.Registration;
using PcelarskiEDnevnik.Modules.Accounts;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Features;
using PcelarskiEDnevnik.Modules.Identity;
using PcelarskiEDnevnik.Modules.Identity.Web;

namespace PcelarskiEDnevnik.Api.Composition;

internal static class EndpointRegistration {
    public static WebApplication MapApplicationEndpoints(
        this WebApplication app) {
        app.MapRegistrationEndpoints();

        app.MapIdentityEndpoints();
        app.MapAccountsEndpoints();
        app.MapBeekeeperProfilesEndpoints();
        app.MapApiariesEndpoints();
        app.MapLocationsEndpoints();
        app.MapProfileEndpoints();

        return app;
    }

    public static WebApplication MapPlatformEndpoints(
        this WebApplication app) {
        app.MapHealthChecks("/health");

        app.MapGet(
                "/",
                () => Results.Ok(new {
                    name = "Pčelarski eDnevnik API",
                    status = "running"
                }))
            .ExcludeFromDescription();

        return app;
    }
}