using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveMaintenanceConfiguration
    : IEntityTypeConfiguration<HiveMaintenance> {
    public void Configure(
        EntityTypeBuilder<HiveMaintenance> builder) {
        builder.ToTable(
            "hive_maintenance",
            "hives",
            table => {
                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });
    }
}
