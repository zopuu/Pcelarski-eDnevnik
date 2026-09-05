using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Relocations.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence;

internal sealed class RelocationsDbContext
    : DbContext {
    public RelocationsDbContext(
        DbContextOptions<
            RelocationsDbContext> options)
        : base(options) {
    }

    public DbSet<Relocation>
        Relocations =>
            Set<Relocation>();

    public DbSet<ApiaryRelocation>
        ApiaryRelocations =>
            Set<ApiaryRelocation>();

    public DbSet<HiveRelocation>
        HiveRelocations =>
            Set<HiveRelocation>();

    public DbSet<HiveRelocationItem>
        HiveRelocationItems =>
            Set<HiveRelocationItem>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder) {
        base.OnModelCreating(
            modelBuilder);

        modelBuilder.HasDefaultSchema(
            "relocations");

        modelBuilder
            .ApplyConfigurationsFromAssembly(
                typeof(RelocationsDbContext)
                    .Assembly);
    }
}