namespace PcelarskiEDnevnik.Api.Composition;

internal static class DevelopmentConfiguration {
    public static WebApplication ConfigureDevelopmentEnvironment(
        this WebApplication app) {
        app.MapOpenApi();

        app.UseSwaggerUI(options => {
            options.SwaggerEndpoint(
                "/openapi/v1.json",
                "Pčelarski eDnevnik API v1");

            options.OAuthClientId(
                "pcelarski-ednevnik-swagger");

            options.OAuthAppName(
                "Pčelarski eDnevnik Swagger");

            options.OAuthScopes(
                "openid",
                "profile",
                "email",
                "pcelarski_api");

            options.OAuthUsePkce();
        });

        app.MapGet(
                "/debug/oauth/callback",
                (
                    string? code,
                    string? state,
                    string? error,
                    string? error_description) =>
                    Results.Ok(new {
                        code,
                        state,
                        error,
                        errorDescription =
                            error_description
                    }))
            .ExcludeFromDescription();

        return app;
    }
}