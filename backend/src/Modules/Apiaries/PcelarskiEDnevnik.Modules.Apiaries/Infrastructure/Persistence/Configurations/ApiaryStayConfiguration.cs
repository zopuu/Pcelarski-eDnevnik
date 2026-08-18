using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Configurations;

internal sealed class ApiaryStayConfiguration
    : IEntityTypeConfiguration<ApiaryStay> {
    public void Configure(
        EntityTypeBuilder<ApiaryStay> builder) {
        builder.ToTable(
            "apiary_stays",
            "apiaries",
            table => {
                table.HasCheckConstraint(
                    "ck_apiary_stays_dates",
                    "\"ended_at_utc\" IS NULL OR " +
                    "\"ended_at_utc\" > \"started_at_utc\"");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_apiary_stays");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.ApiaryId)
            .HasColumnName("apiary_id")
            .IsRequired();

        builder.Property(x => x.LocationId)
            .HasColumnName("location_id")
            .IsRequired();

        builder.Property(x => x.StartedAtUtc)
            .HasColumnName("started_at_utc")
            .IsRequired();

        builder.Property(x => x.EndedAtUtc)
            .HasColumnName("ended_at_utc");

        builder.Property(x => x.Orientation)
            .HasColumnName("orientation")
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.Note)
            .HasColumnName("note")
            .HasMaxLength(ApiaryStayRules.NoteMaxLength);

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(x => x.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.HasOne<Apiary>()
            .WithMany()
            .HasForeignKey(x => x.ApiaryId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_apiary_stays_apiaries_apiary_id");

        builder.HasOne<ApiaryLocation>()
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_apiary_stays_locations_location_id");

        builder.HasIndex(x => x.ApiaryId)
            .HasDatabaseName(
                "ix_apiary_stays_apiary_id");

        builder.HasIndex(x => x.LocationId)
            .HasDatabaseName(
                "ix_apiary_stays_location_id");

        builder.HasIndex(x => x.ApiaryId)
            .IsUnique()
            .HasFilter("\"ended_at_utc\" IS NULL")
            .HasDatabaseName(
                "ux_apiary_stays_one_active_per_apiary");
    }
}