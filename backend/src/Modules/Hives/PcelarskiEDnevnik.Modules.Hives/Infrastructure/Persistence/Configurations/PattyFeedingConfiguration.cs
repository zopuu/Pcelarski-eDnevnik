using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class PattyFeedingConfiguration
    : IEntityTypeConfiguration<PattyFeeding> {
    public void Configure(
        EntityTypeBuilder<PattyFeeding> builder) {
        builder.ToTable(
            "patty_feedings",
            "hives",
            table => {
                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });
    }
}
