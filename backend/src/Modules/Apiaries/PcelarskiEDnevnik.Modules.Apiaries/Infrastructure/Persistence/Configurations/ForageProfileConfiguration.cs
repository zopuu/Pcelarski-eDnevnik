using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Configurations;

internal sealed class ForageProfileConfiguration
    : IEntityTypeConfiguration<ForageProfile> {
    public void Configure(
        EntityTypeBuilder<ForageProfile> builder) {
        builder.ToTable(
            "forage_profiles",
            "apiaries",
            table => {
                table.HasCheckConstraint(
                    "ck_forage_profiles_radius_km",
                    "\"radius_km\" IS NULL OR " +
                    "\"radius_km\" BETWEEN 1 AND 4");
            });

        builder.HasKey(x => x.Id)
            .HasName("pk_forage_profiles");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.Year)
            .HasColumnName("year")
            .IsRequired();

        builder.Property(x => x.RadiusKm)
            .HasColumnName("radius_km")
            .HasColumnType("smallint");

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(ForageProfileRules.NameMaxLength)
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(ForageProfileRules.NotesMaxLength);

        builder.Property(x => x.IsLocked)
            .HasColumnName("is_locked")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.ApiaryStayId)
            .HasColumnName("apiary_stay_id")
            .IsRequired();

        builder.HasOne<ApiaryStay>()
            .WithMany()
            .HasForeignKey(x => x.ApiaryStayId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName(
                "fk_forage_profiles_apiary_stays_apiary_stay_id");

        builder.HasMany(x => x.Items)
            .WithOne()
            .HasForeignKey(x => x.ForageProfileId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName(
                "fk_forage_profile_items_forage_profiles_forage_profile_id");

        builder.Navigation(x => x.Items)
            .UsePropertyAccessMode(
                PropertyAccessMode.Field);

        builder.HasIndex(
                x => new {
                    x.ApiaryStayId,
                    x.Year
                })
            .IsUnique()
            .HasDatabaseName(
                "ux_forage_profiles_apiary_stay_id_year");
    }
}
