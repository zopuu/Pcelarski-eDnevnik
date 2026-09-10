using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Harvests.Domain;

namespace PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence.Configurations;

internal sealed class HoneyBatchConfiguration
    : IEntityTypeConfiguration<HoneyBatch> {
    public void Configure(
        EntityTypeBuilder<HoneyBatch> builder) {
        builder.ToTable(
            "honey_batches",
            "harvests",
            table => {
                table.HasCheckConstraint(
                    "ck_honey_batches_total_amount",
                    "total_amount > 0");

                table.HasCheckConstraint(
                    "ck_honey_batches_period",
                    "period_ended_on >= period_started_on");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_honey_batches");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.OwnerBeekeeperId)
            .HasColumnName("owner_beekeeper_id")
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(
                HoneyHarvestRules.BatchNameMaxLength)
            .IsRequired();

        builder.Property(x => x.BatchCode)
            .HasColumnName("batch_code")
            .HasMaxLength(
                HoneyHarvestRules.BatchCodeMaxLength)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(
                HoneyHarvestRules.BatchStatusMaxLength)
            .IsRequired();

        builder.Property(x => x.TotalAmount)
            .HasColumnName("total_amount")
            .HasPrecision(12, 3)
            .IsRequired();

        builder.Property(x => x.Unit)
            .HasColumnName("unit")
            .HasMaxLength(
                HoneyHarvestRules.UnitMaxLength)
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(
                HoneyHarvestRules.NotesMaxLength);

        builder.Property(x => x.PeriodStartedOn)
            .HasColumnName("period_started_on")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(x => x.PeriodEndedOn)
            .HasColumnName("period_ended_on")
            .HasColumnType("date")
            .IsRequired();

        builder.HasIndex(
                x => new {
                    x.OwnerBeekeeperId,
                    x.BatchCode
                })
            .IsUnique()
            .HasDatabaseName(
                "ux_honey_batches_owner_batch_code");

        builder.HasIndex(
                x => new {
                    x.OwnerBeekeeperId,
                    x.Status
                })
            .HasDatabaseName(
                "ix_honey_batches_owner_status");

        builder.HasIndex(
                x => new {
                    x.OwnerBeekeeperId,
                    x.PeriodStartedOn,
                    x.PeriodEndedOn
                })
            .HasDatabaseName(
                "ix_honey_batches_owner_period");
    }
}