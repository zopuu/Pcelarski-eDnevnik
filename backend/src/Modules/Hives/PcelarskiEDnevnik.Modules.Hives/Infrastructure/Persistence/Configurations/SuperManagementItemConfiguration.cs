using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class SuperManagementItemConfiguration
    : IEntityTypeConfiguration<SuperManagementItem> {
    public void Configure(
        EntityTypeBuilder<SuperManagementItem> builder) {
        builder.ToTable(
            "super_management_items",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_super_management_items_operation",
                    """
                    "operation" IN (
                        'AddToHive',
                        'RemoveForHarvest',
                        'RemoveAndArchive'
                    )
                    """);
            });

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName(
                "id")
            .HasColumnType(
                "uuid")
            .ValueGeneratedNever();

        builder.Property(
                x => x.SuperManagementId)
            .HasColumnName(
                "super_management_id")
            .HasColumnType(
                "uuid")
            .IsRequired();

        builder.Property(
                x => x.HiveSuperId)
            .HasColumnName(
                "hive_super_id")
            .HasColumnType(
                "uuid")
            .IsRequired();

        builder.Property(
                x => x.Operation)
            .HasColumnName(
                "operation")
            .HasColumnType(
                $"character varying({SuperManagementRules.OperationMaxLength})")
            .HasConversion<string>()
            .HasMaxLength(
                SuperManagementRules.OperationMaxLength)
            .IsRequired();

        builder.HasIndex(
                x => new {
                    x.SuperManagementId,
                    x.HiveSuperId
                })
            .IsUnique()
            .HasDatabaseName(
                "ux_super_management_items_management_super");

        builder.HasIndex(
                x => x.HiveSuperId)
            .HasDatabaseName(
                "ix_super_management_items_hive_super_id");

        builder.HasOne<SuperManagement>()
            .WithMany()
            .HasForeignKey(
                x => x.SuperManagementId)
            .OnDelete(
                DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_super_management_items_management");

        builder.HasOne<HiveSuper>()
            .WithMany()
            .HasForeignKey(
                x => x.HiveSuperId)
            .OnDelete(
                DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_super_management_items_super");
    }
}