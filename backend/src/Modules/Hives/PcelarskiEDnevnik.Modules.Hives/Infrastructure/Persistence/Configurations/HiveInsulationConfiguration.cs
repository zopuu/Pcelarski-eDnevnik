using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInsulation;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveInsulationConfiguration
    : IEntityTypeConfiguration<HiveInsulation> {
    public void Configure(
        EntityTypeBuilder<HiveInsulation> builder) {
        builder.ToTable(
            "hive_insulation",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_hive_insulation_operation",
                    """
                    "operation" IN (
                        'Add',
                        'Remove'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_insulation_type_selected",
                    """
                    "paper" OR "eps" OR "xps"
                    """);

                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });

        builder.Property(
                x => x.Operation)
            .HasColumnName(
                "operation")
            .HasColumnType(
                "character varying(20)")
            .HasConversion<string>()
            .HasMaxLength(
                HiveInsulationRules.OperationMaxLength)
            .IsRequired();

        builder.Property(
                x => x.Paper)
            .HasColumnName(
                "paper")
            .HasColumnType(
                "boolean")
            .IsRequired();

        builder.Property(
                x => x.Eps)
            .HasColumnName(
                "eps")
            .HasColumnType(
                "boolean")
            .IsRequired();

        builder.Property(
                x => x.Xps)
            .HasColumnName(
                "xps")
            .HasColumnType(
                "boolean")
            .IsRequired();
    }
}
