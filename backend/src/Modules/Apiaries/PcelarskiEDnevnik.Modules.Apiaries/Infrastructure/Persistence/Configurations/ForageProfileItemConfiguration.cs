using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Configurations;

internal sealed class ForageProfileItemConfiguration
    : IEntityTypeConfiguration<ForageProfileItem> {
    public void Configure(
        EntityTypeBuilder<ForageProfileItem> builder) {
        builder.ToTable(
            "forage_profile_items",
            "apiaries",
            table => {
                table.HasCheckConstraint(
                    "ck_forage_profile_items_percentage",
                    "\"percentage\" > 0 AND " +
                    "\"percentage\" <= 100");

                table.HasCheckConstraint(
                    "ck_forage_profile_items_intensity",
                    "\"intensity\" BETWEEN 1 AND 5");

                table.HasCheckConstraint(
                    "ck_forage_profile_items_forage_type",
                    "\"forage_type\" IN (" +
                    "'Meadow', 'Forest', 'Sunflower', " +
                    "'Acacia', 'Linden', 'OilseedRape', " +
                    "'Clover', 'FruitTrees', 'Chestnut', " +
                    "'Buckwheat', 'Other')");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_forage_profile_items");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.ForageType)
            .HasColumnName("forage_type")
            .HasConversion<string>()
            .HasMaxLength(ForageProfileRules.ForageTypeMaxLength)
            .IsRequired();

        builder.Property(x => x.Percentage)
            .HasColumnName("percentage")
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(x => x.Intensity)
            .HasColumnName("intensity")
            .HasColumnType("smallint")
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(ForageProfileRules.NotesMaxLength);

        builder.Property(x => x.ForageProfileId)
            .HasColumnName("forage_profile_id")
            .IsRequired();

        builder.HasIndex(
                x => new {
                    x.ForageProfileId,
                    x.ForageType
                })
            .IsUnique()
            .HasDatabaseName(
                "ux_forage_profile_items_profile_id_forage_type");
    }
}
