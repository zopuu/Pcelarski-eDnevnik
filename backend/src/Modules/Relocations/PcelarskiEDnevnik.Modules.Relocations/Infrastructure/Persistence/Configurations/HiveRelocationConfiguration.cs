using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Relocations.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence.Configurations;

internal sealed class
    HiveRelocationConfiguration
    : IEntityTypeConfiguration<
        HiveRelocation> {
    public void Configure(
        EntityTypeBuilder<
            HiveRelocation> builder) {
        builder.ToTable(
            "hive_relocations",
            "relocations");

        builder.HasKey(
                x => x.RelocationId)
            .HasName(
                "pk_hive_relocations");

        builder.Property(
                x => x.RelocationId)
            .HasColumnName(
                "relocation_id")
            .ValueGeneratedNever();

        builder.HasOne<Relocation>()
            .WithOne()
            .HasForeignKey<
                HiveRelocation>(
                x => x.RelocationId)
            .OnDelete(
                DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_hive_relocations_relocations_relocation_id");
    }
}