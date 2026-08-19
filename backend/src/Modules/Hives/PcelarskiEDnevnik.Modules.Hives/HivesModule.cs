using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Hives;

public static class HivesModule {
    public static IServiceCollection AddHivesModule(
        this IServiceCollection services,
        IConfiguration configuration) {
        var connectionString =
            configuration.GetConnectionString(
                "Database")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<HivesDbContext>(
            options =>
                options.UseNpgsql(
                    connectionString));

        return services;
    }
}