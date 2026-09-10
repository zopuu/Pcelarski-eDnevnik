using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Harvests.Domain;

namespace PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence.Configurations;

internal sealed class HoneyHarvestConfiguration
    : IEntityTypeConfiguration<HoneyHarvest> {
    public void Configure(
        EntityTypeBuilder<HoneyHarvest> builder) {
        builder.ToTable(
            "honey_harvests",
            "harvests",
            table => {
                table.HasCheckConstraint(
                    "ck_honey_harvests_honey_amount",
                    "honey_amount > 0");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_honey_harvests");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.BeekeeperId)
            .HasColumnName("beekeeper_id")
            .IsRequired();

        builder.Property(x => x.HoneyBatchId)
            .HasColumnName("honey_batch_id")
            .IsRequired();

        builder.Property(x => x.HarvestedOn)
            .HasColumnName("harvested_on")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(
                HoneyHarvestRules.NotesMaxLength);

        builder.Property(x => x.HoneyAmount)
            .HasColumnName("honey_amount")
            .HasPrecision(12, 3)
            .IsRequired();

        builder.Property(x => x.Unit)
            .HasColumnName("unit")
            .HasMaxLength(
                HoneyHarvestRules.UnitMaxLength)
            .IsRequired();

        builder.HasOne<HoneyBatch>()
            .WithMany()
            .HasForeignKey(x => x.HoneyBatchId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_honey_harvests_honey_batches");

        builder.HasIndex(x => x.HoneyBatchId)
            .HasDatabaseName(
                "ix_honey_harvests_honey_batch_id");

        builder.HasIndex(
                x => new {
                    x.BeekeeperId,
                    x.HarvestedOn
                })
            .HasDatabaseName(
                "ix_honey_harvests_beekeeper_harvested_on");
    }
}