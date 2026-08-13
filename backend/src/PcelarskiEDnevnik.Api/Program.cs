using PcelarskiEDnevnik.Modules.Accounts;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles;
using PcelarskiEDnevnik.Modules.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails(options => {
    options.CustomizeProblemDetails = context => {
        context.ProblemDetails.Extensions["traceId"] =
            context.HttpContext.TraceIdentifier;
    };
});

builder.Services.AddOpenApi();

builder.Services.AddHealthChecks();

builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddDataProtection();

builder.Services
    .AddIdentityModule(builder.Configuration)
    .AddAccountsModule(builder.Configuration)
    .AddBeekeeperProfilesModule(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
    await app.Services.InitializeIdentityModuleAsync();
}

app.UseHttpsRedirection();

app.MapHealthChecks("/health");

app.MapGet("/", () => Results.Ok(new {
    name = "Pčelarski eDnevnik API",
    status = "running"
}))
.ExcludeFromDescription();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapIdentityEndpoints();
app.MapAccountsEndpoints();
app.MapBeekeeperProfilesEndpoints();

app.Run();