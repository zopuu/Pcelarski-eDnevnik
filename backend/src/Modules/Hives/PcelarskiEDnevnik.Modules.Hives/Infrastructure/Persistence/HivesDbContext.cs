using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using System.Reflection.Emit;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

public sealed class HivesDbContext(
    DbContextOptions<HivesDbContext> options)
    : DbContext(options) {
    public DbSet<Hive> Hives =>
        Set<Hive>();

    public DbSet<HiveStay> HiveStays =>
        Set<HiveStay>();
    public DbSet<Colony> Colonies =>
    Set<Colony>();

    public DbSet<ColonyStay> ColonyStays =>
        Set<ColonyStay>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder) {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(HivesDbContext).Assembly);
    }
}