using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries
    .Infrastructure.Persistence.Configurations;

internal sealed class ForageObservationConfiguration
    : IEntityTypeConfiguration<ForageObservation> {
    public void Configure(
        EntityTypeBuilder<ForageObservation> builder) {
        builder.ToTable(
            "forage_observations",
            "apiaries",
            table => {
                table.HasCheckConstraint(
                    "ck_forage_observations_intensity",
                    "\"intensity\" BETWEEN 1 AND 5");

                table.HasCheckConstraint(
                    "ck_forage_observations_forage_type",
                    """
                    "forage_type" IN (
                        'Meadow',
                        'Forest',
                        'Sunflower',
                        'Acacia',
                        'Linden',
                        'OilseedRape',
                        'Clover',
                        'FruitTrees',
                        'Chestnut',
                        'Buckwheat',
                        'Other'
                    )
                    """);
            });

        builder.HasKey(x => x.Id)
            .HasName(
                "pk_forage_observations");

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(
                x => x.ObservedByBeekeeperId)
            .HasColumnName(
                "observed_by_beekeeper_id");

        builder.Property(x => x.ObservedAt)
            .HasColumnName("observed_at");

        builder.Property(x => x.ForageType)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasColumnName("forage_type");

        builder.Property(x => x.Intensity)
            .HasColumnName("intensity");

        builder.Property(x => x.Notes)
            .HasMaxLength(
                ForageObservationRules
                    .NotesMaxLength)
            .HasColumnName("notes");

        builder.Property(x => x.LocationId)
            .HasColumnName("location_id");

        builder.Property(
                x => x.ForageProfileId)
            .HasColumnName(
                "forage_profile_id");

        builder.Property(x => x.ImagePath)
            .HasMaxLength(255)
            .HasColumnName("image_path");

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName(
                "created_at_utc");

        builder.Property(x => x.UpdatedAtUtc)
            .HasColumnName(
                "updated_at_utc");

        builder.HasIndex(
                x => new {
                    x.ObservedByBeekeeperId,
                    x.ObservedAt
                })
            .HasDatabaseName(
                "ix_forage_observations_beekeeper_observed_at");

        builder.HasIndex(
                x => new {
                    x.ForageProfileId,
                    x.ObservedAt
                })
            .HasDatabaseName(
                "ix_forage_observations_profile_observed_at");

        builder.HasIndex(x => x.LocationId)
            .HasDatabaseName(
                "ix_forage_observations_location_id");

        builder.HasOne<ApiaryLocation>()
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_forage_observations_locations_location_id");

        builder.HasOne<ForageProfile>()
            .WithMany()
            .HasForeignKey(
                x => x.ForageProfileId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_forage_observations_forage_profiles_forage_profile_id");
    }
}
