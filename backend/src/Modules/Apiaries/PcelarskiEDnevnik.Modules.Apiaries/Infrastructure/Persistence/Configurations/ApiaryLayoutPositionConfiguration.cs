using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Configurations;

internal sealed class ApiaryLayoutPositionConfiguration
    : IEntityTypeConfiguration<ApiaryLayoutPosition> {
    public void Configure(EntityTypeBuilder<ApiaryLayoutPosition> builder) {
        builder.ToTable(
            "apiary_layout_positions",
            "apiaries",
            table => {
                table.HasCheckConstraint(
                    "ck_apiary_layout_positions_x",
                    "\"x\" >= 0");

                table.HasCheckConstraint(
                    "ck_apiary_layout_positions_y",
                    "\"y\" >= 0");
            });

        builder.HasKey(x => new { x.LayoutId, x.HiveId })
            .HasName("pk_apiary_layout_positions");

        builder.Property(x => x.LayoutId)
            .HasColumnName("layout_id")
            .ValueGeneratedNever();

        builder.Property(x => x.HiveId)
            .HasColumnName("hive_id")
            .ValueGeneratedNever();

        builder.Property(x => x.X)
            .HasColumnName("x")
            .IsRequired();

        builder.Property(x => x.Y)
            .HasColumnName("y")
            .IsRequired();
    }
}
