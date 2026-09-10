using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Harvests.Domain;

namespace PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence.Configurations;

internal sealed class HoneyBatchCompositionItemConfiguration
    : IEntityTypeConfiguration<HoneyBatchCompositionItem> {
    public void Configure(
        EntityTypeBuilder<HoneyBatchCompositionItem> builder) {
        builder.ToTable(
            "honey_batch_composition_items",
            "harvests",
            table => {
                table.HasCheckConstraint(
                    "ck_honey_batch_composition_items_percentage",
                    "percentage >= 0 AND percentage <= 100");
            });

        builder.HasKey(x => x.Id)
            .HasName(
                "pk_honey_batch_composition_items");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(
                x => x.HoneyBatchCompositionId)
            .HasColumnName(
                "honey_batch_composition_id")
            .IsRequired();

        builder.Property(x => x.ForageType)
            .HasColumnName("forage_type")
            .HasMaxLength(
                HoneyHarvestRules.ForageTypeMaxLength)
            .IsRequired();

        builder.Property(x => x.Percentage)
            .HasColumnName("percentage")
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(
                HoneyHarvestRules.NotesMaxLength);

        builder.HasOne<HoneyBatchComposition>()
            .WithMany()
            .HasForeignKey(
                x => x.HoneyBatchCompositionId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_honey_batch_composition_items_compositions");

        builder.HasIndex(
                x => new {
                    x.HoneyBatchCompositionId,
                    x.ForageType
                })
            .IsUnique()
            .HasDatabaseName(
                "ux_honey_batch_composition_items_composition_forage");
    }
}