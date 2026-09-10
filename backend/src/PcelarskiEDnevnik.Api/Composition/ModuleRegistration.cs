using PcelarskiEDnevnik.Modules.Accounts;
using PcelarskiEDnevnik.Modules.Apiaries;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles;
using PcelarskiEDnevnik.Modules.Hives;
using PcelarskiEDnevnik.Modules.Identity;
using PcelarskiEDnevnik.Modules.Identity.Web;
using PcelarskiEDnevnik.Modules.Relocations;
using PcelarskiEDnevnik.Modules.Harvests;

namespace PcelarskiEDnevnik.Api.Composition;

internal static class ModuleRegistration {
    public static IServiceCollection AddApplicationModules(
        this IServiceCollection services,
        IConfiguration configuration) {
        services
            .AddIdentityModule(configuration)
            .AddIdentityWebModule()
            .AddAccountsModule(configuration)
            .AddBeekeeperProfilesModule(configuration)
            .AddApiariesModule(configuration)
            .AddHivesModule(configuration)
            .AddRelocationsModule(configuration)
            .AddHarvestsModule(configuration);

        return services;
    }
}