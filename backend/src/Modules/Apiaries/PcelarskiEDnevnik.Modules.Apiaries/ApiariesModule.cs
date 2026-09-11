using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Elevation;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.ReadModels;

namespace PcelarskiEDnevnik.Modules.Apiaries;

public static class ApiariesModule {
    public static IServiceCollection AddApiariesModule(
        this IServiceCollection services,
        IConfiguration configuration) {
        services.AddDbContext<ApiariesDbContext>(
            options => {
                options.UseNpgsql(
                    configuration.GetConnectionString(
                        "Database"));
            });
        services.AddScoped<
            IApiaryAccessChecker,
            ApiaryAccessChecker>();
        services.AddScoped<
            IApiaryHistoryReader,
            ApiaryHistoryReader>();

        services.AddHttpClient(
            OpenTopoDataClient.HttpClientName,
            client => {
                client.BaseAddress =
                    new Uri(
                        "https://api.opentopodata.org/");

                client.Timeout =
                    TimeSpan.FromSeconds(10);
            });
        services.AddScoped<
            IApiaryAccessChecker,
            ApiaryAccessChecker>();
        services.AddScoped<
            IApiaryHarvestContextReader,
            ApiaryHarvestContextReader>();

        return services;
    }
}
