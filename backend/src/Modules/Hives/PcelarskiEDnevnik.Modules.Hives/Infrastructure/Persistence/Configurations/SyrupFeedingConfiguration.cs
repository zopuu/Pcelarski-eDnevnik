using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class SyrupFeedingConfiguration
    : IEntityTypeConfiguration<SyrupFeeding> {
    public void Configure(
        EntityTypeBuilder<SyrupFeeding> builder) {
        builder.ToTable(
            "syrup_feedings",
            "hives",
            table => {
                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });
    }
}
