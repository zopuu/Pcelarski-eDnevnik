using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles
    .Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles;

public static class BeekeeperProfilesModule {
    public static IServiceCollection AddBeekeeperProfilesModule(
        this IServiceCollection services,
        IConfiguration configuration) {
        var connectionString =
            configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException(
                "Connection string 'Database' is not configured.");

        services.AddDbContext<BeekeeperProfilesDbContext>(
            options => {
                options.UseNpgsql(connectionString);
            });

        return services;
    }

    public static IEndpointRouteBuilder MapBeekeeperProfilesEndpoints(
        this IEndpointRouteBuilder endpoints) {
        return endpoints;
    }
}