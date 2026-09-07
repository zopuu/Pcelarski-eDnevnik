using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Configurations;

internal sealed class ApiaryConfiguration
    : IEntityTypeConfiguration<Apiary> {
    public void Configure(
        EntityTypeBuilder<Apiary> builder) {
        builder.ToTable(
            "apiaries",
            "apiaries");

        builder.HasKey(x => x.Id)
            .HasName("pk_apiaries");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.OwnerBeekeeperId)
            .HasColumnName("owner_beekeeper_id")
            .IsRequired();

        builder.Property(x => x.IdentificationNumber)
            .HasColumnName("identification_number")
            .HasMaxLength(ApiaryRules.IdentificationNumberMaxLength);

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(ApiaryRules.NameMaxLength);

        builder.Property(x => x.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.ImagePath)
            .HasColumnName("image_path")
            .HasMaxLength(255);

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(x => x.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.HasIndex(x => x.OwnerBeekeeperId)
            .HasDatabaseName(
                "ix_apiaries_owner_beekeeper_id");

        builder.HasIndex(x => x.IdentificationNumber)
            .IsUnique()
            .HasDatabaseName(
                "ux_apiaries_identification_number");
    }
}
