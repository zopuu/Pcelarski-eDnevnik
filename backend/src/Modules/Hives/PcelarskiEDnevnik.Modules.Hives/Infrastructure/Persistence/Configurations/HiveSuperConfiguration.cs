using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveSuperConfiguration
    : IEntityTypeConfiguration<HiveSuper> {
    public void Configure(
        EntityTypeBuilder<HiveSuper> builder) {
        builder.ToTable(
            "hive_supers",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_hive_supers_frame_count",
                    $"\"frame_count\" >= {HiveSuperRules.MinimumFrameCount}");

                table.HasCheckConstraint(
                    "ck_hive_supers_type",
                    """
                    "type" IN (
                        'DadantBlatt',
                        'LangstrothRoot',
                        'AlbertiZnidersic',
                        'Farrar',
                        'Nucleus',
                        'Other'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_supers_status",
                    """
                    "status" IN (
                        'OnHive',
                        'ReadyForHarvest',
                        'Archived'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_supers_color_hex",
                    """
                    "color_hex" IS NULL
                    OR "color_hex" ~ '^#[0-9A-Fa-f]{6}$'
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
                x => x.OwnerBeekeeperId)
            .HasColumnName(
                "owner_beekeeper_id")
            .HasColumnType(
                "uuid")
            .IsRequired();

        builder.Property(
                x => x.Type)
            .HasColumnName(
                "type")
            .HasColumnType(
                $"character varying({HiveSuperRules.TypeMaxLength})")
            .HasConversion<string>()
            .HasMaxLength(
                HiveSuperRules.TypeMaxLength)
            .IsRequired();

        builder.Property(
                x => x.FrameCount)
            .HasColumnName(
                "frame_count")
            .HasColumnType(
                "integer")
            .IsRequired();

        builder.Property(
                x => x.Status)
            .HasColumnName(
                "status")
            .HasColumnType(
                $"character varying({HiveSuperRules.StatusMaxLength})")
            .HasConversion<string>()
            .HasMaxLength(
                HiveSuperRules.StatusMaxLength)
            .IsRequired();

        builder.Property(
                x => x.ColorHex)
            .HasColumnName(
                "color_hex")
            .HasColumnType(
                $"character varying({HiveSuperRules.ColorHexMaxLength})")
            .HasMaxLength(
                HiveSuperRules.ColorHexMaxLength)
            .IsRequired(false);

        builder.Property(
                x => x.CreatedAtUtc)
            .HasColumnName(
                "created_at_utc")
            .HasColumnType(
                "timestamp with time zone")
            .IsRequired();

        builder.Property(
                x => x.UpdatedAtUtc)
            .HasColumnName(
                "updated_at_utc")
            .HasColumnType(
                "timestamp with time zone")
            .IsRequired(false);

        builder.HasIndex(
                x => new {
                    x.OwnerBeekeeperId,
                    x.Status
                })
            .HasDatabaseName(
                "ix_hive_supers_owner_beekeeper_id_status");
    }
}
