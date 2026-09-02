using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class ColonyConfiguration
    : IEntityTypeConfiguration<Colony> {
    public void Configure(
        EntityTypeBuilder<Colony> builder) {
        builder.ToTable(
            "colonies",
            table => {
                table.HasCheckConstraint(
                    "ck_colonies_origin",
                    """
                    "origin" IS NULL
                    OR "origin" IN (
                        'Swarm',
                        'Purchased',
                        'Split'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_colonies_status",
                    """
                    "status" IN (
                        'Active',
                        'Dead',
                        'Split',
                        'Merged',
                        'Sold',
                        'Lost'
                    )
                    """);
            });

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName(
                "id");

        builder.Property(
                x =>
                    x.OwnerBeekeeperId)
            .HasColumnName(
                "owner_beekeeper_id")
            .IsRequired();

        builder.Property(
                x => x.Origin)
            .HasColumnName(
                "origin")
            .HasConversion<string>()
            .HasMaxLength(
                ColonyRules
                    .OriginMaxLength);

        builder.Property(
                x => x.Status)
            .HasColumnName(
                "status")
            .HasConversion<string>()
            .HasMaxLength(
                ColonyRules
                    .StatusMaxLength)
            .IsRequired();

        builder.Property(
                x => x.FormedOn)
            .HasColumnName(
                "formed_on");

        builder.Property(
                x => x.Notes)
            .HasColumnName(
                "notes")
            .HasMaxLength(
                ColonyRules
                    .NotesMaxLength);

        builder.HasIndex(
                x =>
                    x.OwnerBeekeeperId)
            .HasDatabaseName(
                "ix_colonies_owner_beekeeper_id");
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