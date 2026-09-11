using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestExecution;
using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Harvests.Features.Create;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Finalize;
using PcelarskiEDnevnik.Modules.Harvests.Features.GetAll;
using PcelarskiEDnevnik.Modules.Harvests.Features.GetAvailableGroups;
using PcelarskiEDnevnik.Modules.Harvests.Features.GetById;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetAll;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;
using PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests;

public static class HarvestsModule {
    public static IServiceCollection
        AddHarvestsModule(
            this IServiceCollection services,
            IConfiguration configuration) {
        services.AddDbContext<
            HarvestsDbContext>(
            options => {
                options.UseNpgsql(
                    configuration
                        .GetConnectionString(
                            "Database"));
            });

        services
            .AddOptions<
                HarvestGroupingOptions>()
            .Bind(
                configuration.GetSection(
                    HarvestGroupingOptions
                        .SectionName))
            .ValidateDataAnnotations()
            .Validate(
                x =>
                    !string.IsNullOrWhiteSpace(
                        x.AlgorithmVersion),
                "Harvest grouping algorithm version is required.")
            .ValidateOnStart();

        services.AddScoped<
            HarvestGroupingPolicy>();

        services.AddScoped<
            ForageProfileSimilarityCalculator>();

        services.AddScoped<
            HarvestAreaCompatibility>();

        services.AddScoped<
            HarvestExposureNormalizer>();

        services.AddScoped<
            HarvestSourceResolver>();

        services.AddScoped<
            HarvestSourceCompatibility>();

        services.AddScoped<
            HarvestSourceGrouper>();

        services.AddScoped<
            GetAvailableHarvestGroupsHandler>();
        services.AddScoped<
    HarvestSourceSetResolver>();

        services.AddScoped<
            HarvestAvailabilityService>();

        services.AddScoped<
            HarvestFrameAllocator>();

        services.AddScoped<
            HoneyBatchMatcher>();

        services.AddScoped<
            HarvestFrameInventory>();

        services.AddScoped<
            HarvestWriteTransaction>();

        services.AddScoped<
            CreateHarvestHandler>();

        services.AddScoped<
            GetAvailableHarvestGroupsHandler>();
        services.AddScoped<
    GetHarvestsHandler>();

        services.AddScoped<
            GetHarvestByIdHandler>();

        services.AddScoped<
            GetHoneyBatchesHandler>();

        services.AddScoped<
            GetHoneyBatchByIdHandler>();

        services.AddScoped<
            FinalizeHoneyBatchHandler>();

        return services;
    }
}
