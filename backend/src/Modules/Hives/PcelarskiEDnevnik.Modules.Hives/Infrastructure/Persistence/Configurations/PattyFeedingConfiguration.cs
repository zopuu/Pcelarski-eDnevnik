using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.PattyFeeding;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class PattyFeedingConfiguration
    : IEntityTypeConfiguration<PattyFeeding> {
    public void Configure(
        EntityTypeBuilder<PattyFeeding> builder) {
        builder.ToTable(
            "patty_feedings",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_patty_feedings_mass_positive",
                    "mass_g > 0");

                table.HasCheckConstraint(
                    "ck_patty_feedings_patty_type",
                    """
                    "patty_type" IN (
                        'SUGAR',
                        'PROTEIN',
                        'HONEY',
                        'MEDICATED',
                        'INVERT_SUGAR',
                        'OTHER'
                    )
                    """);

                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });

        builder.Property(
                x => x.MassG)
            .HasColumnName(
                "mass_g")
            .HasColumnType(
                "integer")
            .IsRequired();

        builder.Property(
                x => x.PattyType)
            .HasColumnName(
                "patty_type")
            .HasColumnType(
                "character varying(20)")
            .HasConversion<string>()
            .HasMaxLength(
                PattyFeedingRules.PattyTypeMaxLength)
            .IsRequired();

        builder.Property(
                x => x.Manufacturer)
            .HasColumnName(
                "manufacturer")
            .HasColumnType(
                "character varying(100)")
            .HasMaxLength(
                PattyFeedingRules.ManufacturerMaxLength);
    }
}
