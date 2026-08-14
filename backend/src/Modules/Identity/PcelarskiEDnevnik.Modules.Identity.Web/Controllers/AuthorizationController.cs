using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using PcelarskiEDnevnik.Modules.Identity.Domain;
using System.Collections.Immutable;
using System.Security.Claims;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace PcelarskiEDnevnik.Modules.Identity.Web.Controllers;

public sealed class AuthorizationController : Controller {
    private const string IgnoreAuthenticationChallenge =
        "IgnoreAuthenticationChallenge";

    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IOpenIddictScopeManager _scopeManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthorizationController(
        IOpenIddictApplicationManager applicationManager,
        IOpenIddictScopeManager scopeManager,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager) {
        _applicationManager = applicationManager;
        _scopeManager = scopeManager;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpGet("~/connect/authorize")]
    [HttpPost("~/connect/authorize")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> Authorize(
        CancellationToken cancellationToken) {
        var request =
            HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException(
                "The OpenID Connect request cannot be retrieved.");

        var authentication =
            await HttpContext.AuthenticateAsync(
                IdentityConstants.ApplicationScheme);

        var authenticationIsTooOld =
            request.MaxAge is not null &&
            authentication.Properties?.IssuedUtc is not null &&
            TimeProvider.System.GetUtcNow() -
                authentication.Properties.IssuedUtc >
            TimeSpan.FromSeconds(request.MaxAge.Value);

        var requiresAuthentication =
            !authentication.Succeeded ||
            request.HasPromptValue(PromptValues.Login) ||
            request.MaxAge is 0 ||
            authenticationIsTooOld;

        if (
            requiresAuthentication &&
            TempData[IgnoreAuthenticationChallenge] is not true) {
            if (request.HasPromptValue(PromptValues.None)) {
                return Forbid(
                    authenticationSchemes:
                        OpenIddictServerAspNetCoreDefaults
                            .AuthenticationScheme,
                    properties:
                        new AuthenticationProperties(
                            new Dictionary<string, string?> {
                                [
                                    OpenIddictServerAspNetCoreConstants
                                        .Properties.Error
                                ] = Errors.LoginRequired,

                                [
                                    OpenIddictServerAspNetCoreConstants
                                        .Properties.ErrorDescription
                                ] = "The user is not logged in."
                            }));
            }

            // Prevent:
            //
            // /connect/authorize?prompt=login
            //      -> /account/login
            //      -> /connect/authorize?prompt=login
            //      -> /account/login
            //      -> ...
            TempData[IgnoreAuthenticationChallenge] = true;

            var returnUrl =
                Request.PathBase +
                Request.Path +
                QueryString.Create(
                    Request.HasFormContentType
                        ? Request.Form
                        : Request.Query);

            return Challenge(
                new AuthenticationProperties {
                    RedirectUri = returnUrl
                },
                IdentityConstants.ApplicationScheme);
        }

        var user =
            await _userManager.GetUserAsync(
                authentication.Principal!);

        if (user is null) {
            throw new InvalidOperationException(
                "The authenticated user cannot be found.");
        }

        if (!await _signInManager.CanSignInAsync(user)) {
            return Forbid(
                authenticationSchemes:
                    OpenIddictServerAspNetCoreDefaults
                        .AuthenticationScheme,
                properties:
                    new AuthenticationProperties(
                        new Dictionary<string, string?> {
                            [
                                OpenIddictServerAspNetCoreConstants
                                    .Properties.Error
                            ] = Errors.AccessDenied,

                            [
                                OpenIddictServerAspNetCoreConstants
                                    .Properties.ErrorDescription
                            ] =
                                "The user is no longer allowed to sign in."
                        }));
        }

        var application =
            await _applicationManager.FindByClientIdAsync(
                request.ClientId!,
                cancellationToken)
            ?? throw new InvalidOperationException(
                "The client application cannot be found.");

        if (!await _applicationManager.HasConsentTypeAsync(
                application,
                ConsentTypes.Implicit,
                cancellationToken)) {
            throw new InvalidOperationException(
                "Interactive consent is not implemented " +
                "for this client.");
        }

        var identity =
            new ClaimsIdentity(
                TokenValidationParameters
                    .DefaultAuthenticationType,
                Claims.Name,
                Claims.Role);

        identity
            .SetClaim(
                Claims.Subject,
                await _userManager.GetUserIdAsync(user))

            .SetClaim(
                Claims.Email,
                await _userManager.GetEmailAsync(user))

            .SetClaim(
                Claims.Name,
                await _userManager.GetUserNameAsync(user))

            .SetClaim(
                Claims.PreferredUsername,
                await _userManager.GetUserNameAsync(user))

            .SetClaims(
                Claims.Role,
                (await _userManager.GetRolesAsync(user))
                    .ToImmutableArray());

        identity.SetScopes(
            request.GetScopes());

        identity.SetResources(
            await _scopeManager
                .ListResourcesAsync(
                    identity.GetScopes(),
                    cancellationToken)
                .ToListAsync(cancellationToken));

        identity.SetDestinations(
            GetDestinations);

        return SignIn(
            new ClaimsPrincipal(identity),
            OpenIddictServerAspNetCoreDefaults
                .AuthenticationScheme);
    }

    private static IEnumerable<string> GetDestinations(
        Claim claim) {
        switch (claim.Type) {
            case Claims.Name:
            case Claims.PreferredUsername:
                yield return Destinations.AccessToken;

                if (
                    claim.Subject!
                        .HasScope(Scopes.Profile)) {
                    yield return Destinations.IdentityToken;
                }

                yield break;

            case Claims.Email:
                yield return Destinations.AccessToken;

                if (
                    claim.Subject!
                        .HasScope(Scopes.Email)) {
                    yield return Destinations.IdentityToken;
                }

                yield break;

            case Claims.Role:
                yield return Destinations.AccessToken;
                yield break;

            case "AspNet.Identity.SecurityStamp":
                yield break;

            default:
                yield return Destinations.AccessToken;
                yield break;
        }
    }
}