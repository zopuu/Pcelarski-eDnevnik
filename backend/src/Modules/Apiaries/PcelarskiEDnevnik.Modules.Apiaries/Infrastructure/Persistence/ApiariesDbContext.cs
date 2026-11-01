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

    public DbSet<ApiaryLayout> ApiaryLayouts =>
        Set<ApiaryLayout>();

    public DbSet<ApiaryLayoutPosition> ApiaryLayoutPositions =>
        Set<ApiaryLayoutPosition>();

    public DbSet<ForageProfile> ForageProfiles =>
        Set<ForageProfile>();

    public DbSet<ForageProfileItem> ForageProfileItems =>
        Set<ForageProfileItem>();

    public DbSet<ForageObservation> ForageObservations =>
        Set<ForageObservation>();

    public override int SaveChanges(bool acceptAllChangesOnSuccess) {
        AddLayoutsForNewStays();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default) {
        AddLayoutsForNewStays();
        return base.SaveChangesAsync(
            acceptAllChangesOnSuccess,
            cancellationToken);
    }

    private void AddLayoutsForNewStays() {
        var newStays = ChangeTracker.Entries<ApiaryStay>()
            .Where(entry => entry.State == EntityState.Added)
            .Select(entry => entry.Entity)
            .ToArray();

        if (newStays.Length == 0) {
            return;
        }

        var layoutStayIds = ChangeTracker.Entries<ApiaryLayout>()
            .Where(entry => entry.State != EntityState.Deleted)
            .Select(entry => entry.Entity.ApiaryStayId)
            .ToHashSet();

        foreach (var stay in newStays) {
            if (layoutStayIds.Add(stay.Id)) {
                ApiaryLayouts.Add(ApiaryLayout.Create(stay.Id));
            }
        }
    }

    protected override void OnModelCreating(
        ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("apiaries");

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApiariesDbContext).Assembly);
    }
}
