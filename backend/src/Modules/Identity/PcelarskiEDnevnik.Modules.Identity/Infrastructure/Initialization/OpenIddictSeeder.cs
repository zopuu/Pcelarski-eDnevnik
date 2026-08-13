using OpenIddict.Abstractions;

using static OpenIddict.Abstractions.OpenIddictConstants;

namespace PcelarskiEDnevnik.Modules.Identity.Infrastructure.Initialization;

internal sealed class OpenIddictSeeder {
    private const string MobileClientId = "pcelarski-ednevnik-mobile";
    private const string ApiScope = "pcelarski_api";
    private const string ApiResource = "pcelarski_ednevnik_api";

    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IOpenIddictScopeManager _scopeManager;

    public OpenIddictSeeder(
        IOpenIddictApplicationManager applicationManager,
        IOpenIddictScopeManager scopeManager) {
        _applicationManager = applicationManager;
        _scopeManager = scopeManager;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default) {
        await EnsureApiScopeAsync(cancellationToken);
        await EnsureMobileClientAsync(cancellationToken);
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
}