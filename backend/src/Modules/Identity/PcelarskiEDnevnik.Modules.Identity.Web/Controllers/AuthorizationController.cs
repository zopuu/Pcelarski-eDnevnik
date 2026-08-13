using System.Security.Claims;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using PcelarskiEDnevnik.Modules.Identity.Domain;

using static OpenIddict.Abstractions.OpenIddictConstants;

namespace PcelarskiEDnevnik.Modules.Identity.Web.Controllers;

public sealed class AuthorizationController : Controller {
    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IOpenIddictScopeManager _scopeManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthorizationController(
        IOpenIddictApplicationManager applicationManager,
        IOpenIddictScopeManager scopeManager,
        UserManager<ApplicationUser> userManager) {
        _applicationManager = applicationManager;
        _scopeManager = scopeManager;
        _userManager = userManager;
    }

    [HttpGet("~/connect/authorize")]
    public async Task<IActionResult> Authorize() {
        var request =
            HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException(
                "The OpenID Connect request cannot be retrieved.");

        var authentication =
            await HttpContext.AuthenticateAsync(
                IdentityConstants.ApplicationScheme);

        if (!authentication.Succeeded) {
            if (request.HasPromptValue(PromptValues.None)) {
                return Forbid(
                    OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            }

            var returnUrl =
                Request.PathBase +
                Request.Path +
                Request.QueryString;

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

        var application =
            await _applicationManager.FindByClientIdAsync(
                request.ClientId!)
            ?? throw new InvalidOperationException(
                "The client application cannot be found.");

        if (!await _applicationManager.HasConsentTypeAsync(
                application,
                ConsentTypes.Implicit)) {
            throw new InvalidOperationException(
                "Interactive consent is not implemented " +
                "for this client.");
        }

        var identity = new ClaimsIdentity(
            TokenValidationParameters.DefaultAuthenticationType,
            Claims.Name,
            Claims.Role);

        identity
            .SetClaim(
                Claims.Subject,
                user.Id.ToString())

            .SetClaim(
                Claims.Email,
                user.Email)

            .SetClaim(
                Claims.PreferredUsername,
                user.UserName);

        identity.SetScopes(request.GetScopes());

        identity.SetResources(
            await _scopeManager
                .ListResourcesAsync(identity.GetScopes())
                .ToListAsync());

        identity.SetDestinations(
            static claim => claim.Type switch {
                Claims.Email
                    when claim.Subject!.HasScope(Scopes.Email)
                    =>
                    [
                        Destinations.AccessToken,
                        Destinations.IdentityToken
                    ],

                Claims.PreferredUsername
                    when claim.Subject!.HasScope(Scopes.Profile)
                    =>
                    [
                        Destinations.AccessToken,
                        Destinations.IdentityToken
                    ],

                _ =>
                [
                    Destinations.AccessToken
                ]
            });

        return SignIn(
            new ClaimsPrincipal(identity),
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }
}