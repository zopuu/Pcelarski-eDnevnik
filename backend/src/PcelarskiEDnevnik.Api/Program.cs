using PcelarskiEDnevnik.Modules.Accounts;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles;
using PcelarskiEDnevnik.Modules.Identity;
using PcelarskiEDnevnik.Modules.Identity.Web;
using PcelarskiEDnevnik.Api.Features.Registration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails(options => {
    options.CustomizeProblemDetails = context => {
        context.ProblemDetails.Extensions["traceId"] =
            context.HttpContext.TraceIdentifier;
    };
});

builder.Services.AddOpenApi();

builder.Services.AddHealthChecks();

builder.Services.AddAuthorization();
builder.Services.AddDataProtection();
builder.Services.AddValidation();

builder.Services
    .AddIdentityModule(builder.Configuration)
    .AddIdentityWebModule()
    .AddAccountsModule(builder.Configuration)
    .AddBeekeeperProfilesModule(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();

    app.UseSwaggerUI(options => {
        options.SwaggerEndpoint(
            "/openapi/v1.json",
            "Pčelarski eDnevnik API v1");
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