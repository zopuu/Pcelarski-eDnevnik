using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.ReadModels;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveActionTimelineRowConfiguration
    : IEntityTypeConfiguration<HiveActionTimelineRow> {
    public void Configure(
        EntityTypeBuilder<HiveActionTimelineRow> builder) {
        builder.HasNoKey();

        // This read model deliberately bypasses TPT polymorphism. Mapping it
        // as a view makes EF compose a single-table SELECT against hive_actions.
        builder.ToView(
            "hive_actions",
            "hives");

        builder.Property(
                x => x.Id)
            .HasColumnName(
                "id")
            .HasColumnType(
                "uuid");

        builder.Property(
                x => x.HiveId)
            .HasColumnName(
                "hive_id")
            .HasColumnType(
                "uuid");

        builder.Property(
                x => x.PerformedAt)
            .HasColumnName(
                "performed_at")
            .HasColumnType(
                "timestamp with time zone");

        builder.Property(
                x => x.ActionType)
            .HasColumnName(
                "action_type")
            .HasColumnType(
                "character varying(30)")
            .HasConversion<string>()
            .HasMaxLength(30);
    }
}
