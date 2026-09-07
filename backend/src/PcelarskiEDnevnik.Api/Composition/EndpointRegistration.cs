using PcelarskiEDnevnik.Api.Features.Registration;
using PcelarskiEDnevnik.Modules.Accounts;
using PcelarskiEDnevnik.Api.Features.Profile;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Locations;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Features;
using PcelarskiEDnevnik.Modules.Hives.Features.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Features.Hives;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation;
using PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings;
using PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings;
using PcelarskiEDnevnik.Modules.Hives.Features.Queens;
using PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings;
using PcelarskiEDnevnik.Modules.Identity;
using PcelarskiEDnevnik.Modules.Relocations;
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
        app.MapUpdateMyProfileEndpoint();
        app.MapColoniesEndpoints();
        app.MapHivesEndpoints();
        app.MapHiveInsulationEndpoints();
        app.MapHoneyFrameFeedingEndpoints();
        app.MapPattyFeedingEndpoints();
        app.MapQueensEndpoints();
        app.MapSyrupFeedingEndpoints();
        app.MapForageObservationsEndpoints();
        app.MapRelocationsEndpoints();

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
