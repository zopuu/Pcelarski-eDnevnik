using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Configurations;

internal sealed class ApiaryLocationConfiguration
    : IEntityTypeConfiguration<ApiaryLocation> {
    public void Configure(
        EntityTypeBuilder<ApiaryLocation> builder) {
        builder.ToTable(
            "locations",
            "apiaries",
            table => {
                table.HasCheckConstraint(
                    "ck_locations_latitude",
                    "\"latitude\" >= -90 AND \"latitude\" <= 90");

                table.HasCheckConstraint(
                    "ck_locations_longitude",
                    "\"longitude\" >= -180 AND \"longitude\" <= 180");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_locations");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.OwnerBeekeeperId)
            .HasColumnName("owner_beekeeper_id")
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(
                ApiaryLocationRules.NameMaxLength);

        builder.Property(x => x.Latitude)
            .HasColumnName("latitude")
            .HasPrecision(9, 6)
            .IsRequired();

        builder.Property(x => x.Longitude)
            .HasColumnName("longitude")
            .HasPrecision(9, 6)
            .IsRequired();

        builder.Property(x => x.AltitudeMeters)
            .HasColumnName("altitude_m");

        builder.Property(x => x.CadastralParcelNumber)
            .HasColumnName(
                "cadastral_parcel_number")
            .HasMaxLength(
                ApiaryLocationRules
                    .CadastralParcelNumberMaxLength);

        builder.Property(x => x.Description)
            .HasColumnName("description")
            .HasMaxLength(
                ApiaryLocationRules
                    .DescriptionMaxLength);

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(x => x.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.HasIndex(x => x.OwnerBeekeeperId)
            .HasDatabaseName(
                "ix_locations_owner_beekeeper_id");
    }
}