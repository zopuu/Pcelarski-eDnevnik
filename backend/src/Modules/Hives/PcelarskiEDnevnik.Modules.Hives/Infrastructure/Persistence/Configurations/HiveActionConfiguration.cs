using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveActionConfiguration
    : IEntityTypeConfiguration<HiveAction> {
    public void Configure(
        EntityTypeBuilder<HiveAction> builder) {
        builder.UseTptMappingStrategy();

        builder.ToTable(
            "hive_actions",
            "hives");

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
                x => x.PerformedAt)
            .HasColumnName(
                "performed_at")
            .HasColumnType(
                "timestamp with time zone")
            .IsRequired();

        builder.Property(
                x => x.PerformedByBeekeeperId)
            .HasColumnName(
                "performed_by_beekeeper_id")
            .HasColumnType(
                "uuid")
            .IsRequired();

        builder.Property(
                x => x.ActionGroupId)
            .HasColumnName(
                "action_group_id")
            .HasColumnType(
                "uuid");

        builder.Property(
                x => x.ImageUrl)
            .HasColumnName(
                "image_url")
            .HasColumnType(
                "character varying(255)")
            .HasMaxLength(
                HiveActionRules.ImageUrlMaxLength);

        builder.Property(
                x => x.Notes)
            .HasColumnName(
                "notes")
            .HasColumnType(
                "character varying(1000)")
            .HasMaxLength(
                HiveActionRules.NotesMaxLength);

        builder.HasOne<Hive>()
            .WithMany()
            .HasForeignKey(
                x => x.HiveId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.HasIndex(
                x => x.ActionGroupId)
            .HasFilter(
                "\"action_group_id\" IS NOT NULL")
            .HasDatabaseName(
                "ix_hive_actions_action_group_id");

        builder.HasIndex(
                x => new {
                    x.HiveId,
                    x.PerformedAt
                })
            .HasDatabaseName(
                "ix_hive_actions_hive_id_performed_at");
    }
}
