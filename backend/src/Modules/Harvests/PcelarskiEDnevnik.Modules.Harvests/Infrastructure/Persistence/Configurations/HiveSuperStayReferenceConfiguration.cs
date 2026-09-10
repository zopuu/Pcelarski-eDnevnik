using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence.References;

namespace PcelarskiEDnevnik.Modules.Harvests
    .Infrastructure.Persistence.Configurations;

internal sealed class HiveSuperStayReferenceConfiguration
    : IEntityTypeConfiguration<HiveSuperStayReference> {
    public void Configure(
        EntityTypeBuilder<HiveSuperStayReference> builder) {
        builder.ToTable(
            "hive_super_stays",
            "hives",
            table => {
                table.ExcludeFromMigrations();
            });

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
    }
}