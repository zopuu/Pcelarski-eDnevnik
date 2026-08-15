using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

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

        return services;
    }
}