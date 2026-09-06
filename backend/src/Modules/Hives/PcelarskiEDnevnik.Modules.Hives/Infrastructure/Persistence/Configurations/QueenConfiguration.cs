using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class QueenConfiguration
    : IEntityTypeConfiguration<Queen> {
    public void Configure(
        EntityTypeBuilder<Queen> builder) {
        builder.ToTable(
            "queens",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_queens_origin",
                    """
                    "origin" IS NULL
                    OR "origin" IN (
                        'Purchased',
                        'Produced'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_queens_status",
                    """
                    "status" IN (
                        'Active',
                        'Dead',
                        'Killed',
                        'Missing',
                        'Sold',
                        'Removed'
                    )
                    """);
            });

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName("id");

        builder.Property(
                x => x.OwnerBeekeeperId)
            .HasColumnName(
                "owner_beekeeper_id")
            .IsRequired();

        builder.Property(
                x => x.MarkingColorHex)
            .HasColumnName(
                "marking_color_hex")
            .HasMaxLength(
                QueenRules.MarkingColorHexLength);

        builder.Property(
                x => x.Origin)
            .HasColumnName(
                "origin")
            .HasConversion<string>()
            .HasMaxLength(
                QueenRules.OriginMaxLength);

        builder.Property(
                x => x.Breeder)
            .HasColumnName(
                "breeder")
            .HasMaxLength(
                QueenRules.BreederMaxLength);

        builder.Property(
                x => x.Breed)
            .HasColumnName(
                "breed")
            .HasMaxLength(
                QueenRules.BreedMaxLength);

        builder.Property(
                x => x.Status)
            .HasColumnName(
                "status")
            .HasConversion<string>()
            .HasMaxLength(
                QueenRules.StatusMaxLength)
            .IsRequired();

        builder.Property(
                x => x.EmergedOn)
            .HasColumnName(
                "emerged_on");

        builder.Property(
                x => x.AcquiredOn)
            .HasColumnName(
                "acquired_on");

        builder.Property(
                x => x.Notes)
            .HasColumnName(
                "notes")
            .HasMaxLength(
                QueenRules.NotesMaxLength);

        builder.Property(
                x => x.CreatedAtUtc)
            .HasColumnName(
                "created_at_utc")
            .IsRequired();

        builder.Property(
                x => x.UpdatedAtUtc)
            .HasColumnName(
                "updated_at_utc");

        builder.HasIndex(
                x => x.OwnerBeekeeperId)
            .HasDatabaseName(
                "ix_queens_owner_beekeeper_id");
    }
}
