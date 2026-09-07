using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class VarroaTreatmentConfiguration
    : IEntityTypeConfiguration<VarroaTreatment> {
    public void Configure(
        EntityTypeBuilder<VarroaTreatment> builder) {
        builder.ToTable(
            "varroa_treatments",
            "hives",
            table => {
                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });
    }
}
