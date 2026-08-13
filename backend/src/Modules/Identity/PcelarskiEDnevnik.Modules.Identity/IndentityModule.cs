using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.Identity.Domain;
using PcelarskiEDnevnik.Modules.Identity.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Identity;

public static class IdentityModule {
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration) {
        var connectionString =
            configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException(
                "Connection string 'Database' is not configured.");

        services.AddDbContext<IdentityModuleDbContext>(options => {
            options.UseNpgsql(connectionString);
        });

        services
            .AddIdentityCore<ApplicationUser>(options => {
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<IdentityModuleDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        return services;
    }

    public static IEndpointRouteBuilder MapIdentityEndpoints(
        this IEndpointRouteBuilder endpoints) {
        return endpoints;
    }
}