using PcelarskiEDnevnik.Api.Composition;
using PcelarskiEDnevnik.Modules.Identity;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder =
    WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices(builder.Configuration)
    .AddApplicationModules(builder.Configuration);

builder.Services.ConfigureHttpJsonOptions(
    options => {
        options.SerializerOptions.Converters.Add(
            new JsonStringEnumConverter(
                JsonNamingPolicy.CamelCase,
                allowIntegerValues: false));
    });

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