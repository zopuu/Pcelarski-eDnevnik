using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles
    .Infrastructure.Persistence.Configurations;

internal sealed class BeekeeperProfileConfiguration
    : IEntityTypeConfiguration<BeekeeperProfile> {
    public void Configure(
        EntityTypeBuilder<BeekeeperProfile> builder) {
        builder.ToTable("beekeeper_profiles");

        builder.HasKey(x => x.Id)
            .HasName("pk_beekeeper_profiles");

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.HasIndex(x => x.UserId)
            .IsUnique()
            .HasDatabaseName("ux_beekeeper_profiles_user_id");

        builder.Property(x => x.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Hid)
            .HasColumnName("hid")
            .HasMaxLength(12);

        builder.HasIndex(x => x.Hid)
            .IsUnique()
            .HasDatabaseName("ux_beekeeper_profiles_hid");

        builder.Property(x => x.Phone)
            .HasColumnName("phone")
            .HasMaxLength(20);

        builder.Property(x => x.AgriculturalHoldingNumber)
            .HasColumnName("agricultural_holding_number");

        builder.HasIndex(x => x.AgriculturalHoldingNumber)
            .IsUnique()
            .HasDatabaseName(
                "ux_beekeeper_profiles_agricultural_holding_number");

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(x => x.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");
    }
}