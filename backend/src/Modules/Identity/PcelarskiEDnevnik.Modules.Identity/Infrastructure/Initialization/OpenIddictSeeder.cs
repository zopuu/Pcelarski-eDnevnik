using OpenIddict.Abstractions;
using Microsoft.Extensions.Configuration;

using static OpenIddict.Abstractions.OpenIddictConstants;

namespace PcelarskiEDnevnik.Modules.Identity.Infrastructure.Initialization;

internal sealed class OpenIddictSeeder {
    private const string MobileClientId = "pcelarski-ednevnik-mobile";
    private const string SwaggerClientId =
                                "pcelarski-ednevnik-swagger";
    private const string ApiScope = "pcelarski_api";
    private const string ApiResource = "pcelarski_ednevnik_api";

    private const string DevelopmentClientId =
    "pcelarski-ednevnik-dev-tester";

    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IOpenIddictScopeManager _scopeManager;
    private readonly IConfiguration _configuration;

    public OpenIddictSeeder(
        IOpenIddictApplicationManager applicationManager,
        IOpenIddictScopeManager scopeManager,
        IConfiguration configuration) {
            _applicationManager = applicationManager;
            _scopeManager = scopeManager;
            _configuration = configuration;
    }

    public async Task SeedAsync(
        CancellationToken cancellationToken = default) {
            await EnsureApiScopeAsync(cancellationToken);
            await EnsureMobileClientAsync(cancellationToken);

            await EnsureSwaggerClientAsync(cancellationToken);

        await EnsureDevelopmentClientAsync(
                cancellationToken);
    }
    private async Task EnsureDevelopmentClientAsync(
    CancellationToken cancellationToken) {
        var redirectUri =
            _configuration[
                "Identity:DevelopmentClient:RedirectUri"];

        if (string.IsNullOrWhiteSpace(redirectUri)) {
            return;
        }

        var descriptor =
            new OpenIddictApplicationDescriptor {
                ApplicationType =
                    ApplicationTypes.Native,

                ClientId =
                    DevelopmentClientId,

                ClientType =
                    ClientTypes.Public,

                ConsentType =
                    ConsentTypes.Implicit,

                DisplayName =
                    "Pčelarski eDnevnik Development Tester",

                RedirectUris =
                {
                new Uri(redirectUri)
                },

                Permissions =
                {
                Permissions.Endpoints.Authorization,
                Permissions.Endpoints.Token,

                Permissions.GrantTypes.AuthorizationCode,
                Permissions.GrantTypes.RefreshToken,

                Permissions.ResponseTypes.Code,

                Permissions.Scopes.Email,
                Permissions.Scopes.Profile,

                Permissions.Prefixes.Scope + ApiScope
                },

                Requirements =
                {
                Requirements.Features
                    .ProofKeyForCodeExchange
                }
            };

        var application =
            await _applicationManager
                .FindByClientIdAsync(
                    DevelopmentClientId,
                    cancellationToken);

        if (application is null) {
            await _applicationManager.CreateAsync(
                descriptor,
                cancellationToken);

            return;
        }

        await _applicationManager.UpdateAsync(
            application,
            descriptor,
            cancellationToken);
    }

    private async Task EnsureApiScopeAsync(
        CancellationToken cancellationToken) {
        if (await _scopeManager.FindByNameAsync(
                ApiScope,
                cancellationToken) is not null) {
            return;
        }

        var descriptor = new OpenIddictScopeDescriptor {
            Name = ApiScope,
            DisplayName = "Pčelarski eDnevnik API"
        };

        descriptor.Resources.Add(ApiResource);

        await _scopeManager.CreateAsync(
            descriptor,
            cancellationToken);
    }

    private async Task EnsureMobileClientAsync(
        CancellationToken cancellationToken) {
        if (await _applicationManager.FindByClientIdAsync(
                MobileClientId,
                cancellationToken) is not null) {
            return;
        }

        var descriptor = new OpenIddictApplicationDescriptor {
            ApplicationType = ApplicationTypes.Native,

            ClientId = MobileClientId,

            ClientType = ClientTypes.Public,

            ConsentType = ConsentTypes.Implicit,

            DisplayName = "Pčelarski eDnevnik Mobile",

            RedirectUris =
            {
                new Uri("pcelarskiednevnik://auth/callback")
            },

            PostLogoutRedirectUris =
            {
                new Uri("pcelarskiednevnik://auth/logout")
            },

            Permissions =
            {
                Permissions.Endpoints.Authorization,
                Permissions.Endpoints.Token,
                Permissions.Endpoints.EndSession,

                Permissions.GrantTypes.AuthorizationCode,
                Permissions.GrantTypes.RefreshToken,

                Permissions.ResponseTypes.Code,

                Permissions.Scopes.Email,
                Permissions.Scopes.Profile,

                Permissions.Prefixes.Scope + ApiScope
            },

            Requirements =
            {
                Requirements.Features.ProofKeyForCodeExchange
            }
        };

        var application = await _applicationManager.FindByClientIdAsync(
                                                        MobileClientId,
                                                        cancellationToken);

        if (application is null) {
            await _applicationManager.CreateAsync(
                descriptor,
                cancellationToken);

            return;
        }

        await _applicationManager.UpdateAsync(
            application,
            descriptor,
            cancellationToken);
    }
    private async Task EnsureSwaggerClientAsync(
    CancellationToken cancellationToken) {
        var redirectUri =
            _configuration["Identity:SwaggerClient:RedirectUri"];

        if (string.IsNullOrWhiteSpace(redirectUri)) {
            return;
        }

        var descriptor = new OpenIddictApplicationDescriptor {
            ClientId = SwaggerClientId,
            ClientType = OpenIddictConstants.ClientTypes.Public,
            ConsentType = OpenIddictConstants.ConsentTypes.Implicit,
            DisplayName = "Pčelarski eDnevnik Swagger",

            RedirectUris =
            {
            new Uri(redirectUri)
        },

            Permissions =
            {
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.Endpoints.Token,

            OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,

            OpenIddictConstants.Permissions.ResponseTypes.Code,

            OpenIddictConstants.Permissions.Scopes.Email,
            OpenIddictConstants.Permissions.Scopes.Profile,

            OpenIddictConstants.Permissions.Prefixes.Scope
                + ApiScope
        },

            Requirements =
            {
            OpenIddictConstants.Requirements.Features
                .ProofKeyForCodeExchange
        }
        };

        var application =
            await _applicationManager.FindByClientIdAsync(
                SwaggerClientId,
                cancellationToken);

        if (application is null) {
            await _applicationManager.CreateAsync(
                descriptor,
                cancellationToken);

            return;
        }

        await _applicationManager.UpdateAsync(
            application,
            descriptor,
            cancellationToken);
    }
}