using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Relocations.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence.Configurations;

internal sealed class
    RelocationConfiguration
    : IEntityTypeConfiguration<Relocation> {
    public void Configure(
        EntityTypeBuilder<Relocation> builder) {
        builder.ToTable(
            "relocations",
            "relocations",
            table => {
                table.HasCheckConstraint(
                    "ck_relocations_cost_amount",
                    "\"cost_amount\" IS NULL OR \"cost_amount\" >= 0");

                table.HasCheckConstraint(
                    "ck_relocations_distance_km",
                    "\"distance_km\" IS NULL OR \"distance_km\" >= 0");
                table.HasCheckConstraint(
    "ck_relocations_currency_code",
    """
    "currency_code" IS NULL
    OR "currency_code" ~ '^[A-Z]{3}$'
    """);


                table.HasCheckConstraint(
                    "ck_relocations_cost_currency",
                    """
                    (
                        "cost_amount" IS NULL
                        AND
                        "currency_code" IS NULL
                    )
                    OR
                    (
                        "cost_amount" IS NOT NULL
                        AND
                        "currency_code" IS NOT NULL
                    )
                    """);
                table.HasCheckConstraint(
                    "ck_relocations_kind",
                    "\"kind\" IN ('WholeApiary', 'SelectedHives')");
                table.HasCheckConstraint(
                    "ck_relocations_transport_method",
                    "\"transport_method\" IN ('Trailer', 'Truck', 'Van', 'Other')");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_relocations");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(
                x => x.BeekeeperId)
            .HasColumnName(
                "beekeeper_id")
            .IsRequired();

        builder.Property(
                x => x.OccurredAtUtc)
            .HasColumnName(
                "occurred_at_utc")
            .IsRequired();

        builder.Property(
                x => x.CostAmount)
            .HasColumnName(
                "cost_amount")
            .HasPrecision(
                RelocationRules
                    .CostAmountPrecision,
                RelocationRules
                    .CostAmountScale);

        builder.Property(
                x => x.CurrencyCode)
            .HasColumnName(
                "currency_code")
            .HasMaxLength(
                RelocationRules
                    .CurrencyCodeMaxLength);

        builder.Property(
                x => x.TransportMethod)
            .HasColumnName(
                "transport_method")
            .HasConversion<string>()
            .HasMaxLength(
                RelocationRules
                    .TransportMethodMaxLength)
            .IsRequired();

        builder.Property(
                x => x.DistanceKm)
            .HasColumnName(
                "distance_km")
            .HasPrecision(
                RelocationRules
                    .DistanceKmPrecision,
                RelocationRules
                    .DistanceKmScale);
        builder.Property(x => x.Kind)
            .HasColumnName("kind")
            .HasConversion<string>()
            .HasMaxLength(
                RelocationRules.KindMaxLength)
            .IsRequired();

        builder.Property(
                x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(
                RelocationRules
                    .NotesMaxLength);

        builder.Property(
                x => x.CreatedAtUtc)
            .HasColumnName(
                "created_at_utc")
            .IsRequired();

        builder.HasIndex(
                x => new {
                    x.BeekeeperId,
                    x.OccurredAtUtc
                })
            .HasDatabaseName(
                "ix_relocations_beekeeper_id_occurred_at_utc");
    }
}
