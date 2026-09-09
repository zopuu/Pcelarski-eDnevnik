using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SyrupFeeding;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class SyrupFeedingConfiguration
    : IEntityTypeConfiguration<SyrupFeeding> {
    public void Configure(
        EntityTypeBuilder<SyrupFeeding> builder) {
        builder.ToTable(
            "syrup_feedings",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_syrup_feedings_quantity_positive",
                    "quantity_ml > 0");

                table.HasCheckConstraint(
                    "ck_syrup_feedings_sugar_parts_positive",
                    "sugar_parts > 0");

                table.HasCheckConstraint(
                    "ck_syrup_feedings_water_parts_positive",
                    "water_parts > 0");

                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });

        builder.Property(
                x => x.QuantityMl)
            .HasColumnName(
                "quantity_ml")
            .HasColumnType(
                "integer")
            .IsRequired();

        builder.Property(
                x => x.SugarParts)
            .HasColumnName(
                "sugar_parts")
            .HasColumnType(
                "numeric")
            .IsRequired();

        builder.Property(
                x => x.WaterParts)
            .HasColumnName(
                "water_parts")
            .HasColumnType(
                "numeric")
            .IsRequired();

        builder.Property(
                x => x.Additives)
            .HasColumnName(
                "additives")
            .HasColumnType(
                "character varying(500)")
            .HasMaxLength(
                SyrupFeedingRules.AdditivesMaxLength);
    }
}
