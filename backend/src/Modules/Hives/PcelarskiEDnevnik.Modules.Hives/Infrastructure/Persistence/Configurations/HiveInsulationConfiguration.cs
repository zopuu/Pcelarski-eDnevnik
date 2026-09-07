using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveInsulationConfiguration
    : IEntityTypeConfiguration<HiveInsulation> {
    public void Configure(
        EntityTypeBuilder<HiveInsulation> builder) {
        builder.ToTable(
            "hive_insulation",
            "hives",
            table => {
                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });
    }
}
