using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveSuperStayConfiguration
    : IEntityTypeConfiguration<HiveSuperStay> {
    public void Configure(
        EntityTypeBuilder<HiveSuperStay> builder) {
        builder.ToTable(
            "hive_super_stays",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_hive_super_stays_dates",
                    """
                    "ended_on" IS NULL
                    OR "ended_on" >= "started_on"
                    """);

                table.HasCheckConstraint(
                    "ck_hive_super_stays_harvestable_frame_count",
                    $"""
                    "harvestable_frame_count" IS NULL
                    OR "harvestable_frame_count" >= {HiveSuperStayRules.MinimumHarvestableFrameCount}
                    """);

                table.HasCheckConstraint(
                    "ck_hive_super_stays_remaining_frame_count",
                    $"""
                    "remaining_harvestable_frame_count" IS NULL
                    OR "remaining_harvestable_frame_count" >= {HiveSuperStayRules.MinimumRemainingHarvestableFrameCount}
                    """);

                table.HasCheckConstraint(
                    "ck_hive_super_stays_frame_counts_pair",
                    """
                    (
                        "harvestable_frame_count" IS NULL
                        AND
                        "remaining_harvestable_frame_count" IS NULL
                    )
                    OR
                    (
                        "harvestable_frame_count" IS NOT NULL
                        AND
                        "remaining_harvestable_frame_count" IS NOT NULL
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_super_stays_remaining_not_greater_than_total",
                    """
                    "remaining_harvestable_frame_count" IS NULL
                    OR
                    "remaining_harvestable_frame_count"
                        <= "harvestable_frame_count"
                    """);

                table.HasCheckConstraint(
                    "ck_hive_super_stays_harvest_requires_end",
                    """
                    "harvestable_frame_count" IS NULL
                    OR "ended_on" IS NOT NULL
                    """);
            });

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName(
                "id")
            .HasColumnType(
                "uuid")
            .ValueGeneratedNever();

        builder.Property(
                x => x.HiveId)
            .HasColumnName(
                "hive_id")
            .HasColumnType(
                "uuid")
            .IsRequired();

        builder.Property(
                x => x.HiveSuperId)
            .HasColumnName(
                "hive_super_id")
            .HasColumnType(
                "uuid")
            .IsRequired();

        builder.Property(
                x => x.StartedOn)
            .HasColumnName(
                "started_on")
            .HasColumnType(
                "date")
            .IsRequired();

        builder.Property(
                x => x.EndedOn)
            .HasColumnName(
                "ended_on")
            .HasColumnType(
                "date")
            .IsRequired(false);

        builder.Property(
                x => x.HarvestableFrameCount)
            .HasColumnName(
                "harvestable_frame_count")
            .HasColumnType(
                "integer")
            .IsRequired(false);

        builder.Property(
                x => x.RemainingHarvestableFrameCount)
            .HasColumnName(
                "remaining_harvestable_frame_count")
            .HasColumnType(
                "integer")
            .IsRequired(false);

        builder.HasIndex(
                x => x.HiveSuperId)
            .IsUnique()
            .HasDatabaseName(
                "ux_hive_super_stays_active_super")
            .HasFilter(
                "\"ended_on\" IS NULL");

        builder.HasIndex(
                x => x.HiveId)
            .HasDatabaseName(
                "ix_hive_super_stays_active_hive")
            .HasFilter(
                "\"ended_on\" IS NULL");

        builder.HasIndex(
                x => new {
                    x.HiveId,
                    x.StartedOn
                })
            .HasDatabaseName(
                "ix_hive_super_stays_hive_started_on");

        builder.HasIndex(
                x => new {
                    x.HiveSuperId,
                    x.StartedOn
                })
            .HasDatabaseName(
                "ix_hive_super_stays_super_started_on");

        builder.HasOne<Hive>()
            .WithMany()
            .HasForeignKey(
                x => x.HiveId)
            .OnDelete(
                DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_hive_super_stays_hive");

        builder.HasOne<HiveSuper>()
            .WithMany()
            .HasForeignKey(
                x => x.HiveSuperId)
            .OnDelete(
                DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_hive_super_stays_super");
    }
}
