using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.ReadModels;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

public sealed class HivesDbContext(
    DbContextOptions<HivesDbContext> options)
    : DbContext(options) {
    public DbSet<Hive> Hives =>
        Set<Hive>();

    public DbSet<HiveStay> HiveStays =>
        Set<HiveStay>();

    public DbSet<HiveAction> HiveActions =>
        Set<HiveAction>();

    internal DbSet<HiveActionTimelineRow> HiveActionTimelineRows =>
        Set<HiveActionTimelineRow>();

    public DbSet<HiveInsulation> HiveInsulations =>
        Set<HiveInsulation>();

    public DbSet<SyrupFeeding> SyrupFeedings =>
        Set<SyrupFeeding>();

    public DbSet<PattyFeeding> PattyFeedings =>
        Set<PattyFeeding>();

    public DbSet<HoneyFrameFeeding> HoneyFrameFeedings =>
        Set<HoneyFrameFeeding>();

    public DbSet<VarroaTreatment> VarroaTreatments =>
        Set<VarroaTreatment>();

    public DbSet<HiveMaintenance> HiveMaintenances =>
        Set<HiveMaintenance>();

    public DbSet<HiveInspection> HiveInspections =>
        Set<HiveInspection>();

    public DbSet<SuperManagement> SuperManagements =>
        Set<SuperManagement>();

    public DbSet<Colony> Colonies =>
        Set<Colony>();

    public DbSet<ColonyStay> ColonyStays =>
        Set<ColonyStay>();
    public DbSet<Queen> Queens =>
        Set<Queen>();
    public DbSet<QueenStay> QueenStays =>
        Set<QueenStay>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder) {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(HivesDbContext).Assembly);
    }
}
