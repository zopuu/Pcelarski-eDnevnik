using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Persistence;

public sealed class BeekeeperProfilesDbContext : DbContext {
    public BeekeeperProfilesDbContext(
        DbContextOptions<BeekeeperProfilesDbContext> options)
        : base(options) {
    }

    public DbSet<BeekeeperProfile> BeekeeperProfiles =>
        Set<BeekeeperProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.HasDefaultSchema("profiles");

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(BeekeeperProfilesDbContext).Assembly);
    }
}