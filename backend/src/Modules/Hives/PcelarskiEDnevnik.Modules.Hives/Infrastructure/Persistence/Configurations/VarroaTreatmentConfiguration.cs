using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.VaroaTreatment;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class VarroaTreatmentConfiguration
    : IEntityTypeConfiguration<VarroaTreatment> {
    public void Configure(
        EntityTypeBuilder<VarroaTreatment> builder) {
        builder.ToTable(
            "varroa_treatments",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_varroa_treatments_dose_amount_positive",
                    "dose_amount > 0");

                table.HasCheckConstraint(
                    "ck_varroa_treatments_application_method",
                    """
                    "application_method" IN (
                        'STRIPS',
                        'FUMIGATION',
                        'TRICKLING',
                        'VAPORIZATION',
                        'SPRAYING',
                        'OTHER'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_varroa_treatments_dose_unit",
                    """
                    "dose_unit" IN (
                        'ML',
                        'STRIPS',
                        'G'
                    )
                    """);

                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });

        builder.Property(
                x => x.ProductName)
            .HasColumnName(
                "product_name")
            .HasColumnType(
                "character varying(50)")
            .HasMaxLength(
                VarroaTreatmentRules
                    .ProductNameMaxLength)
            .IsRequired();

        builder.Property(
                x => x.ApplicationMethod)
            .HasColumnName(
                "application_method")
            .HasColumnType(
                "character varying(20)")
            .HasConversion<string>()
            .HasMaxLength(
                VarroaTreatmentRules
                    .ApplicationMethodMaxLength)
            .IsRequired();

        builder.Property(
                x => x.DoseAmount)
            .HasColumnName(
                "dose_amount")
            .HasColumnType(
                "numeric(4,2)")
            .HasPrecision(
                4,
                2)
            .IsRequired();

        builder.Property(
                x => x.DoseUnit)
            .HasColumnName(
                "dose_unit")
            .HasColumnType(
                "character varying(10)")
            .HasConversion<string>()
            .HasMaxLength(
                VarroaTreatmentRules
                    .DoseUnitMaxLength)
            .IsRequired();
    }
}
