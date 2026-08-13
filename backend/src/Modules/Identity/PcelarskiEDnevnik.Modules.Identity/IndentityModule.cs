using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;
using PcelarskiEDnevnik.Modules.Identity.Domain;
using PcelarskiEDnevnik.Modules.Identity.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Identity.Infrastructure.Initialization;

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

            // Adds the OpenIddict EF Core entities to this DbContext.
            options.UseOpenIddict();
        });

        services
            .AddIdentityCore<ApplicationUser>(options => {
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<IdentityModuleDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        services
            .AddOpenIddict()

            // OpenIddict persistence.
            .AddCore(options => {
                options
                    .UseEntityFrameworkCore()
                    .UseDbContext<IdentityModuleDbContext>();
            })

            // OAuth 2.0 / OpenID Connect authorization server.
            .AddServer(options => {
                options.SetAuthorizationEndpointUris("/connect/authorize");
                options.SetTokenEndpointUris("/connect/token");
                options.SetEndSessionEndpointUris("/connect/logout");

                options.AllowAuthorizationCodeFlow();
                options.AllowRefreshTokenFlow();

                // Required for our React Native / Expo public client.
                options.RequireProofKeyForCodeExchange();

                options.RegisterScopes(
                    OpenIddictConstants.Scopes.Email,
                    OpenIddictConstants.Scopes.Profile,
                    "pcelarski_api");

                // Development only.
                options.AddDevelopmentEncryptionCertificate();
                options.AddDevelopmentSigningCertificate();

                // Produce signed JWT access tokens rather than encrypted
                // access tokens. This makes the API boundary easier to
                // separate into an external authorization server later.
                options.DisableAccessTokenEncryption();

                options
                    .UseAspNetCore()
                    .EnableAuthorizationEndpointPassthrough()
                    .EnableEndSessionEndpointPassthrough();
            })

            // Allows our API to validate tokens issued by this
            // OpenIddict server.
            .AddValidation(options => {
                options.UseLocalServer();
                options.UseAspNetCore();
            });
        services.AddScoped<OpenIddictSeeder>();

        return services;
    }

    public static IEndpointRouteBuilder MapIdentityEndpoints(
        this IEndpointRouteBuilder endpoints) {
        return endpoints;
    }
    public static async Task InitializeIdentityModuleAsync(
    this IServiceProvider services,
    CancellationToken cancellationToken = default) {
        await using var scope = services.CreateAsyncScope();

        var seeder =
            scope.ServiceProvider.GetRequiredService<OpenIddictSeeder>();

        await seeder.SeedAsync(cancellationToken);
    }
}