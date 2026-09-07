using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HoneyFrameFeedingConfiguration
    : IEntityTypeConfiguration<HoneyFrameFeeding> {
    public void Configure(
        EntityTypeBuilder<HoneyFrameFeeding> builder) {
        builder.ToTable(
            "honey_frame_feedings",
            "hives",
            table => {
                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });
    }
}
