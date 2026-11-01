using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Configurations;

internal sealed class ApiaryLayoutConfiguration
    : IEntityTypeConfiguration<ApiaryLayout> {
    public void Configure(EntityTypeBuilder<ApiaryLayout> builder) {
        builder.ToTable(
            "apiary_layouts",
            "apiaries",
            table => table.HasCheckConstraint(
                "ck_apiary_layouts_version",
                "\"version\" >= 1"));

        builder.HasKey(x => x.Id)
            .HasName("pk_apiary_layouts");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.ApiaryStayId)
            .HasColumnName("apiary_stay_id")
            .IsRequired();

        builder.Property(x => x.Version)
            .HasColumnName("version")
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(x => x.UpdatedAtUtc)
            .HasColumnName("updated_at_utc")
            .IsRequired();

        builder.HasOne<ApiaryStay>()
            .WithOne()
            .HasForeignKey<ApiaryLayout>(x => x.ApiaryStayId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_apiary_layouts_apiary_stays_apiary_stay_id");

        builder.HasMany(x => x.Positions)
            .WithOne()
            .HasForeignKey(x => x.LayoutId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_apiary_layout_positions_apiary_layouts_layout_id");

        builder.Navigation(x => x.Positions)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(x => x.ApiaryStayId)
            .IsUnique()
            .HasDatabaseName("ux_apiary_layouts_apiary_stay_id");
    }
}
