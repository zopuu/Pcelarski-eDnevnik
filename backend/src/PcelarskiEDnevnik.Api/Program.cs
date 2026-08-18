using PcelarskiEDnevnik.Api.Composition;
using PcelarskiEDnevnik.Modules.Identity;

var builder =
    WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices(builder.Configuration)
    .AddApplicationModules(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment()) {
    app.ConfigureDevelopmentEnvironment();

    await app.Services
        .InitializeIdentityModuleAsync();
}

app.UseHttpsRedirection();

app.UseCors(
    ApiServiceRegistration.FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapPlatformEndpoints();

app.MapControllers();

app.MapApplicationEndpoints();

app.Run();