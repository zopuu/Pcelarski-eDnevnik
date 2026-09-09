using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveMaintenanceConfiguration
    : IEntityTypeConfiguration<HiveMaintenance> {
    public void Configure(
        EntityTypeBuilder<HiveMaintenance> builder) {
        builder.ToTable(
            "hive_maintenance",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_hive_maintenance_maintenance_type",
                    """
                    "maintenance_type" IN (
                        'PAINTING',
                        'FLOOR_REPAIR',
                        'LID_REPLACEMENT',
                        'ENTRANCE_REPLACEMENT',
                        'VARROA_SCREEN_INSTALLATION',
                        'DISINFECTION',
                        'REPAIR',
                        'OTHER'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_maintenance_cost_amount_non_negative",
                    "\"cost_amount\" IS NULL OR \"cost_amount\" >= 0");

                table.HasCheckConstraint(
                    "ck_hive_maintenance_cost_currency_pair",
                    """
                    (
                        "cost_amount" IS NULL
                        AND "currency_code" IS NULL
                    ) OR (
                        "cost_amount" IS NOT NULL
                        AND "currency_code" IS NOT NULL
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_maintenance_currency_code_format",
                    "\"currency_code\" IS NULL OR \"currency_code\" ~ '^[A-Z]{3}$'");

                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });

        builder.Property(
                x => x.MaintenanceType)
            .HasColumnName(
                "maintenance_type")
            .HasColumnType(
                "character varying(30)")
            .HasConversion<string>()
            .HasMaxLength(
                HiveMaintenanceRules
                    .MaintenanceTypeMaxLength)
            .IsRequired();

        builder.Property(
                x => x.CostAmount)
            .HasColumnName(
                "cost_amount")
            .HasColumnType(
                "numeric(12,2)")
            .HasPrecision(
                HiveMaintenanceRules
                    .CostPrecision,
                HiveMaintenanceRules
                    .CostScale);

        builder.Property(
                x => x.CurrencyCode)
            .HasColumnName(
                "currency_code")
            .HasColumnType(
                "character varying(3)")
            .HasMaxLength(
                HiveMaintenanceRules
                    .CurrencyCodeLength);

        builder.Property(
                x => x.ServiceProvider)
            .HasColumnName(
                "service_provider")
            .HasColumnType(
                "character varying(100)")
            .HasMaxLength(
                HiveMaintenanceRules
                    .ServiceProviderMaxLength);
    }
}
