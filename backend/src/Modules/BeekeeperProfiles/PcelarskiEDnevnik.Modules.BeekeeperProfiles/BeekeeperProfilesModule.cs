using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles;

public static class BeekeeperProfilesModule {
    public static IServiceCollection AddBeekeeperProfilesModule(
        this IServiceCollection services,
        IConfiguration configuration) {
        return services;
    }

    public static IEndpointRouteBuilder MapBeekeeperProfilesEndpoints(
        this IEndpointRouteBuilder endpoints) {
        return endpoints;
    }
}