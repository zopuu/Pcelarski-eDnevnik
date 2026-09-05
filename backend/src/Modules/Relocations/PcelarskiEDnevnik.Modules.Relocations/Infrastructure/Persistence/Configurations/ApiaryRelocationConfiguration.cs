using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Relocations.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence.Configurations;

internal sealed class
    ApiaryRelocationConfiguration
    : IEntityTypeConfiguration<
        ApiaryRelocation> {
    public void Configure(
        EntityTypeBuilder<
            ApiaryRelocation> builder) {
        builder.ToTable(
            "apiary_relocations",
            "relocations",
            table => {
                table.HasCheckConstraint(
                    "ck_apiary_relocations_different_stays",
                    "\"origin_apiary_stay_id\" <> \"destination_apiary_stay_id\"");
            });

        builder.HasKey(
                x => x.RelocationId)
            .HasName(
                "pk_apiary_relocations");

        builder.Property(
                x => x.RelocationId)
            .HasColumnName(
                "relocation_id")
            .ValueGeneratedNever();

        builder.Property(
                x => x.OriginApiaryStayId)
            .HasColumnName(
                "origin_apiary_stay_id")
            .IsRequired();

        builder.Property(
                x => x.DestinationApiaryStayId)
            .HasColumnName(
                "destination_apiary_stay_id")
            .IsRequired();

        builder.HasOne<Relocation>()
            .WithOne()
            .HasForeignKey<
                ApiaryRelocation>(
                x => x.RelocationId)
            .OnDelete(
                DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_apiary_relocations_relocations_relocation_id");

        builder.HasIndex(
                x => x.OriginApiaryStayId)
            .IsUnique()
            .HasDatabaseName(
                "ux_apiary_relocations_origin_apiary_stay_id");

        builder.HasIndex(
                x =>
                    x.DestinationApiaryStayId)
            .IsUnique()
            .HasDatabaseName(
                "ux_apiary_relocations_destination_apiary_stay_id");
    }
}