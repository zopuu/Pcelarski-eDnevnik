using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace PcelarskiEDnevnik.Api.OpenApi;

internal sealed class OAuthSecuritySchemeTransformer
    : IOpenApiDocumentTransformer {
    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken) {
        var securityScheme = new OpenApiSecurityScheme {
            Type = SecuritySchemeType.OAuth2,

            Flows = new OpenApiOAuthFlows {
                AuthorizationCode = new OpenApiOAuthFlow {
                    AuthorizationUrl = new Uri(
                        "/connect/authorize",
                        UriKind.Relative),

                    TokenUrl = new Uri(
                        "/connect/token",
                        UriKind.Relative),

                    Scopes = new Dictionary<string, string> {
                        ["openid"] = "OpenID Connect",
                        ["profile"] = "Basic profile information",
                        ["email"] = "Email address",
                        ["pcelarski_api"] =
                            "Access to the Pčelarski eDnevnik API"
                    }
                }
            }
        };

        document.Components ??= new OpenApiComponents();

        document.Components.SecuritySchemes ??=
            new Dictionary<string, IOpenApiSecurityScheme>();

        document.Components.SecuritySchemes["oauth2"] =
            securityScheme;

        return Task.CompletedTask;
    }
}