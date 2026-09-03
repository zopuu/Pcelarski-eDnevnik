using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

public sealed class ApiariesDbContext(
    DbContextOptions<ApiariesDbContext> options)
    : DbContext(options) {
    public DbSet<Apiary> Apiaries =>
    Set<Apiary>();

    public DbSet<ApiaryLocation> Locations =>
        Set<ApiaryLocation>();

    public DbSet<ApiaryStay> ApiaryStays =>
        Set<ApiaryStay>();

    public DbSet<ForageProfile> ForageProfiles =>
        Set<ForageProfile>();

    public DbSet<ForageProfileItem> ForageProfileItems =>
        Set<ForageProfileItem>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("apiaries");

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApiariesDbContext).Assembly);
    }
}
