using PcelarskiEDnevnik.Modules.Accounts;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles;
using PcelarskiEDnevnik.Modules.Identity;
using PcelarskiEDnevnik.Modules.Identity.Web;
using PcelarskiEDnevnik.Api.Features.Registration;
using PcelarskiEDnevnik.Api.OpenApi;
using PcelarskiEDnevnik.Api.Authentication;
using PcelarskiEDnevnik.SharedKernel.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails(options => {
    options.CustomizeProblemDetails = context => {
        context.ProblemDetails.Extensions["traceId"] =
            context.HttpContext.TraceIdentifier;
    };
});

builder.Services.AddOpenApi(options => {
    options.AddDocumentTransformer<
        OAuthSecuritySchemeTransformer>();

    options.AddOperationTransformer<
        OAuthSecurityRequirementTransformer>();
});

builder.Services.AddHealthChecks();

builder.Services.AddAuthorization();
builder.Services.AddDataProtection();
builder.Services.AddValidation();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<
    ICurrentUserContext,
    HttpCurrentUserContext>();

builder.Services
    .AddIdentityModule(builder.Configuration)
    .AddIdentityWebModule()
    .AddAccountsModule(builder.Configuration)
    .AddBeekeeperProfilesModule(builder.Configuration);

var frontendOrigins =
    builder.Configuration
        .GetSection("Frontend:AllowedOrigins")
        .Get<string[]>()
    ?? [];

builder.Services.AddCors(options => {
    options.AddPolicy(
        "Frontend",
        policy => {
            policy
                .WithOrigins(frontendOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
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

    await app.Services.InitializeIdentityModuleAsync();

    app.MapGet(
        "/debug/oauth/callback",
        (
            string? code,
            string? state,
            string? error,
            string? error_description) => {
                return Results.Ok(new {
                    code,
                    state,
                    error,
                    errorDescription = error_description
                });
            })
        .ExcludeFromDescription();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapGet("/", () => Results.Ok(new {
    name = "Pčelarski eDnevnik API",
    status = "running"
}))
.ExcludeFromDescription();

app.MapControllers();

app.MapRegistrationEndpoints();

app.MapIdentityEndpoints();
app.MapAccountsEndpoints();
app.MapBeekeeperProfilesEndpoints();

app.Run();