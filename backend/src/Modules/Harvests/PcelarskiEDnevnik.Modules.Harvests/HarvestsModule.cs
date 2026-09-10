using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests;

public static class HarvestsModule {
    public static IServiceCollection AddHarvestsModule(
        this IServiceCollection services,
        IConfiguration configuration) {
        services.AddDbContext<HarvestsDbContext>(
            options => {
                options.UseNpgsql(
                    configuration.GetConnectionString(
                        "Database"));
            });

        return services;
    }
}