using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveConfiguration
    : IEntityTypeConfiguration<Hive> {
    public void Configure(
        EntityTypeBuilder<Hive> builder) {
        builder.ToTable(
            "hives",
            "hives");

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(
                x => x.OwnerBeekeeperId)
            .HasColumnName("owner_beekeeper_id")
            .IsRequired();

        builder.Property(
                x => x.IdentificationNumber)
            .HasColumnName("identification_number")
            .HasMaxLength(
                HiveRules.IdentificationNumberLength);

        builder.Property(
                x => x.Label)
            .HasColumnName("label")
            .HasMaxLength(
                HiveRules.LabelMaxLength)
            .IsRequired();

        builder.Property(
                x => x.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(
                x => x.ColorHex)
            .HasColumnName("color_hex")
            .HasMaxLength(
                HiveRules.ColorHexLength);

        builder.Property(
                x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(
                x => x.ManufactureDate)
            .HasColumnName("manufacture_date")
            .HasColumnType("date");

        builder.Property(
                x => x.Manufacturer)
            .HasColumnName("manufacturer")
            .HasMaxLength(
                HiveRules.ManufacturerMaxLength);

        builder.Property(
                x => x.Material)
            .HasColumnName("material")
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(
                x => x.PurchaseDate)
            .HasColumnName("purchase_date")
            .HasColumnType("date");

        builder.Property(
                x => x.HasFeeder)
            .HasColumnName("has_feeder")
            .IsRequired();

        builder.Property(
                x => x.FeederVolumeMl)
            .HasColumnName("feeder_volume_ml");

        builder.Property(
                x => x.Note)
            .HasColumnName("note");

        builder.Property(
                x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(
                x => x.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.HasIndex(
                x => x.OwnerBeekeeperId)
            .HasDatabaseName(
                "ix_hives_owner_beekeeper_id");

        builder.HasIndex(
        x => x.IdentificationNumber)
        .IsUnique()
        .HasDatabaseName(
            "ux_hives_identification_number");
    }
}