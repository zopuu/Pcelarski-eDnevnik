using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Relocations.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence.Configurations;

internal sealed class
    HiveRelocationItemConfiguration
    : IEntityTypeConfiguration<
        HiveRelocationItem> {
    public void Configure(
        EntityTypeBuilder<
            HiveRelocationItem> builder) {
        builder.ToTable(
            "hive_relocation_items",
            "relocations",
            table => {
                table.HasCheckConstraint(
                    "ck_hive_relocation_items_different_stays",
                    "\"origin_hive_stay_id\" <> \"destination_hive_stay_id\"");
            });

        builder.HasKey(x => x.Id)
            .HasName(
                "pk_hive_relocation_items");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(
                x => x.HiveRelocationId)
            .HasColumnName(
                "hive_relocation_id")
            .IsRequired();

        builder.Property(
                x => x.OriginHiveStayId)
            .HasColumnName(
                "origin_hive_stay_id")
            .IsRequired();

        builder.Property(
                x => x.DestinationHiveStayId)
            .HasColumnName(
                "destination_hive_stay_id")
            .IsRequired();

        builder.HasOne<HiveRelocation>()
            .WithMany()
            .HasForeignKey(
                x => x.HiveRelocationId)
            .OnDelete(
                DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_hive_relocation_items_hive_relocations_hive_relocation_id");

        builder.HasIndex(
                x => x.HiveRelocationId)
            .HasDatabaseName(
                "ix_hive_relocation_items_hive_relocation_id");

        builder.HasIndex(
                x => x.OriginHiveStayId)
            .IsUnique()
            .HasDatabaseName(
                "ux_hive_relocation_items_origin_hive_stay_id");

        builder.HasIndex(
                x =>
                    x.DestinationHiveStayId)
            .IsUnique()
            .HasDatabaseName(
                "ux_hive_relocation_items_destination_hive_stay_id");
    }
}