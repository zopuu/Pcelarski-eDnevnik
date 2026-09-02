using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class ColonyStayConfiguration
    : IEntityTypeConfiguration<ColonyStay> {
    public void Configure(
        EntityTypeBuilder<ColonyStay> builder) {
        builder.ToTable(
            "colony_stays",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_colony_stays_dates",
                    """
                    "ended_on" IS NULL
                    OR "ended_on" >= "started_on"
                    """);
            });

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName(
                "id");

        builder.Property(
                x => x.ColonyId)
            .HasColumnName(
                "colony_id")
            .IsRequired();

        builder.Property(
                x => x.HiveId)
            .HasColumnName(
                "hive_id")
            .IsRequired();

        builder.Property(
                x => x.StartedOn)
            .HasColumnName(
                "started_on")
            .IsRequired();

        builder.Property(
                x => x.EndedOn)
            .HasColumnName(
                "ended_on");

        builder.Property(
                x => x.Notes)
            .HasColumnName(
                "notes")
            .HasMaxLength(
                ColonyStayRules
                    .NotesMaxLength);

        builder.HasIndex(
                x => x.ColonyId)
            .IsUnique()
            .HasFilter(
                "\"ended_on\" IS NULL")
            .HasDatabaseName(
                "ux_colony_stays_active_colony");

        builder.HasIndex(
                x => x.HiveId)
            .IsUnique()
            .HasFilter(
                "\"ended_on\" IS NULL")
            .HasDatabaseName(
                "ux_colony_stays_active_hive");

        builder.HasIndex(
                x => new {
                    x.ColonyId,
                    x.StartedOn
                })
            .HasDatabaseName(
                "ix_colony_stays_colony_started_on");

        builder.HasIndex(
                x => new {
                    x.HiveId,
                    x.StartedOn
                })
            .HasDatabaseName(
                "ix_colony_stays_hive_started_on");

        builder.HasOne<Colony>()
            .WithMany()
            .HasForeignKey(
                x => x.ColonyId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.HasOne<Hive>()
            .WithMany()
            .HasForeignKey(
                x => x.HiveId)
            .OnDelete(
                DeleteBehavior.Restrict);
        builder.Property(
            x => x.CreatedAtUtc)
        .HasColumnName(
            "created_at_utc")
        .IsRequired();

        builder.Property(
                x => x.UpdatedAtUtc)
            .HasColumnName(
                "updated_at_utc");
    }
}