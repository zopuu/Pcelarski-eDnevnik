using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests.Domain;

namespace PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence;

public sealed class HarvestsDbContext
    : DbContext {
    public HarvestsDbContext(
        DbContextOptions<HarvestsDbContext> options)
        : base(options) {
    }

    public DbSet<HoneyHarvest> HoneyHarvests =>
        Set<HoneyHarvest>();

    public DbSet<HoneyHarvestItem>
        HoneyHarvestItems =>
            Set<HoneyHarvestItem>();

    public DbSet<HoneyBatch> HoneyBatches =>
        Set<HoneyBatch>();

    public DbSet<HoneyBatchComposition>
        HoneyBatchCompositions =>
            Set<HoneyBatchComposition>();

    public DbSet<HoneyBatchCompositionItem>
        HoneyBatchCompositionItems =>
            Set<HoneyBatchCompositionItem>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("harvests");

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(HarvestsDbContext).Assembly);
    }
}