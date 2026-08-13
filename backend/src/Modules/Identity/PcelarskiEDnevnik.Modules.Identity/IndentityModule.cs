using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;
using OpenIddict.Validation.AspNetCore;
using PcelarskiEDnevnik.Modules.Identity.Domain;
using PcelarskiEDnevnik.Modules.Identity.Infrastructure.Initialization;
using PcelarskiEDnevnik.Modules.Identity.Infrastructure.Persistence;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;

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
        services.AddScoped<OpenIddictSeeder>();
        services.AddScoped<DevelopmentUserSeeder>();

        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .AddAuthenticationSchemes(
                    OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)
                .RequireAuthenticatedUser()
                .RequireAssertion(context =>
                    context.User.HasScope("pcelarski_api"))
                .Build();
        });

        return services;
    }

    public static IEndpointRouteBuilder MapIdentityEndpoints(
    this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGet("/api/me", (ClaimsPrincipal user) => {
                return Results.Ok(new {
                    userId = user.GetClaim(
                        OpenIddictConstants.Claims.Subject),

                    email = user.GetClaim(
                        OpenIddictConstants.Claims.Email),

                    username = user.GetClaim(
                        OpenIddictConstants.Claims.PreferredUsername)
                });
            })
            .RequireAuthorization();

        return endpoints;
    }
    public static async Task InitializeIdentityModuleAsync(
    this IServiceProvider services,
    CancellationToken cancellationToken = default) {
        await using var scope =
            services.CreateAsyncScope();

        var openIddictSeeder =
            scope.ServiceProvider
                .GetRequiredService<OpenIddictSeeder>();

        await openIddictSeeder.SeedAsync(
            cancellationToken);

        var developmentUserSeeder =
            scope.ServiceProvider
                .GetRequiredService<DevelopmentUserSeeder>();

        await developmentUserSeeder.SeedAsync();
    }
}