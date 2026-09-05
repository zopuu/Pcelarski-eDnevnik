using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.Relocations.Features.Create;
using PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Relocations;

public static class RelocationsModule {
    public static IServiceCollection
        AddRelocationsModule(
            this IServiceCollection services,
            IConfiguration configuration) {
        var connectionString = configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException("Database connection string is not configured.");

        services.AddDbContext<
            RelocationsDbContext>(
            options => {
                options.UseNpgsql(
                    connectionString,
                    npgsql => {
                        npgsql
                            .MigrationsHistoryTable(
                                "__EFMigrationsHistory",
                                "relocations");
                    });
            });

        services.AddScoped<
            CreateRelocationHandler>();

        services.AddScoped<
            RelocationTransactionCoordinator>();

        return services;
    }
}