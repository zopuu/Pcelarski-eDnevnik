using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HoneyFrameFeeding;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HoneyFrameFeedingConfiguration
    : IEntityTypeConfiguration<HoneyFrameFeeding> {
    public void Configure(
        EntityTypeBuilder<HoneyFrameFeeding> builder) {
        builder.ToTable(
            "honey_frame_feedings",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_honey_frame_feedings_frame_count_positive",
                    "frame_count > 0");

                table.HasCheckConstraint(
                    "ck_honey_frame_feedings_frame_count_maximum",
                    $"frame_count <= {HoneyFrameFeedingRules.MaximumFrameCount}");

                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });

        builder.Property(
                x => x.FrameCount)
            .HasColumnName(
                "frame_count")
            .HasColumnType(
                "integer")
            .IsRequired();

        builder.Property(
                x => x.FrameSource)
            .HasColumnName(
                "frame_source")
            .HasColumnType(
                "character varying(100)")
            .HasMaxLength(
                HoneyFrameFeedingRules
                    .FrameSourceMaxLength);
    }
}
