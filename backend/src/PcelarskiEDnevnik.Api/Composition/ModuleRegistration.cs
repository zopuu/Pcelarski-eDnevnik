using PcelarskiEDnevnik.Modules.Accounts;
using PcelarskiEDnevnik.Modules.Apiaries;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles;
using PcelarskiEDnevnik.Modules.Identity;
using PcelarskiEDnevnik.Modules.Identity.Web;

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
            .AddApiariesModule(configuration);

        return services;
    }
}