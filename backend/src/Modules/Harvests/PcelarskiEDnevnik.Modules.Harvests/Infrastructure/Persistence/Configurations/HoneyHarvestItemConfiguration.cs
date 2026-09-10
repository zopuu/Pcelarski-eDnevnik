using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Harvests.Domain;
using PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence.References;

namespace PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence.Configurations;

internal sealed class HoneyHarvestItemConfiguration
    : IEntityTypeConfiguration<HoneyHarvestItem> {
    public void Configure(
        EntityTypeBuilder<HoneyHarvestItem> builder) {
        builder.ToTable(
            "honey_harvest_items",
            "harvests",
            table => {
                table.HasCheckConstraint(
                    "ck_honey_harvest_items_frames_harvested",
                    "frames_harvested > 0");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_honey_harvest_items");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.HoneyHarvestId)
            .HasColumnName("honey_harvest_id")
            .IsRequired();

        builder.Property(x => x.HiveSuperStayId)
            .HasColumnName("hive_super_stay_id")
            .IsRequired();

        builder.Property(x => x.FramesHarvested)
            .HasColumnName("frames_harvested")
            .IsRequired();

        builder.HasOne<HoneyHarvest>()
            .WithMany()
            .HasForeignKey(x => x.HoneyHarvestId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_honey_harvest_items_honey_harvests");
        builder.HasOne<HiveSuperStayReference>()
            .WithMany()
            .HasForeignKey(x => x.HiveSuperStayId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_honey_harvest_items_hive_super_stays");

        builder.HasIndex(
                x => new {
                    x.HoneyHarvestId,
                    x.HiveSuperStayId
                })
            .IsUnique()
            .HasDatabaseName(
                "ux_honey_harvest_items_harvest_super_stay");

        builder.HasIndex(x => x.HiveSuperStayId)
            .HasDatabaseName(
                "ix_honey_harvest_items_hive_super_stay_id");
    }
}