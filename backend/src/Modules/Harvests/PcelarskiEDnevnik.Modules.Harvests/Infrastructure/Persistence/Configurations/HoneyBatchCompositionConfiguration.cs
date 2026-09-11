using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Harvests.Domain;

namespace PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence.Configurations;

internal sealed class HoneyBatchCompositionConfiguration
    : IEntityTypeConfiguration<HoneyBatchComposition> {
    public void Configure(
        EntityTypeBuilder<HoneyBatchComposition> builder) {
        builder.ToTable(
            "honey_batch_compositions",
            "harvests");

        builder.HasKey(x => x.Id)
            .HasName(
                "pk_honey_batch_compositions");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.HoneyBatchId)
            .HasColumnName("honey_batch_id")
            .IsRequired();

        builder.Property(x => x.AlgorithmVersion)
            .HasColumnName("algorithm_version")
            .HasMaxLength(
                HoneyHarvestRules
                    .AlgorithmVersionMaxLength)
            .IsRequired(false);

        builder.Property(x => x.EvidenceReference)
            .HasColumnName("evidence_reference")
            .HasMaxLength(
                HoneyHarvestRules.EvidenceReferenceMaxLength);

        builder.Property(x => x.DeterminedAt)
            .HasColumnName("determined_at")
            .HasColumnType(
                "timestamp with time zone")
            .IsRequired();

        builder.Property(x => x.DeterminationMethod)
            .HasColumnName("determination_method")
            .HasConversion<string>()
            .HasMaxLength(
                HoneyHarvestRules
                    .DeterminationMethodMaxLength)
            .IsRequired();

        builder.HasOne<HoneyBatch>()
            .WithMany()
            .HasForeignKey(x => x.HoneyBatchId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_honey_batch_compositions_honey_batches");

        builder.HasIndex(
                x => new {
                    x.HoneyBatchId,
                    x.DeterminedAt
                })
            .HasDatabaseName(
                "ix_honey_batch_compositions_batch_determined_at");

        builder.HasIndex(x => x.HoneyBatchId)
            .IsUnique()
            .HasFilter("determination_method = 'Calculated'")
            .HasDatabaseName(
                "ux_honey_batch_compositions_calculated_batch");
    }
}
