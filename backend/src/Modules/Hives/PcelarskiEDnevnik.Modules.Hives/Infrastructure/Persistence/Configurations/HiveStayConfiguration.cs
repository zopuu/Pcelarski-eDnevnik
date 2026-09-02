using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveStayConfiguration
    : IEntityTypeConfiguration<HiveStay> {
    public void Configure(
        EntityTypeBuilder<HiveStay> builder) {
        builder.ToTable(
            "hive_stays",
            "hives",
            tableBuilder => {
                tableBuilder.HasCheckConstraint(
                    "ck_hive_stays_date_range",
                    "ended_at_utc IS NULL OR ended_at_utc >= started_at_utc");
            });

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(
                x => x.HiveId)
            .HasColumnName("hive_id")
            .IsRequired();

        builder.Property(
                x => x.ApiaryId)
            .HasColumnName("apiary_id")
            .IsRequired();

        builder.Property(
                x => x.StartedAtUtc)
            .HasColumnName("started_at_utc")
            .IsRequired();

        builder.Property(
                x => x.EndedAtUtc)
            .HasColumnName("ended_at_utc");

        builder.Property(
                x => x.Note)
            .HasColumnName("note");

        builder.HasOne<Hive>()
            .WithMany()
            .HasForeignKey(
                x => x.HiveId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.HasIndex(
                x => x.ApiaryId)
            .HasDatabaseName(
                "ix_hive_stays_apiary_id");

        builder.HasIndex(
                x => x.HiveId)
            .IsUnique()
            .HasFilter(
                "ended_at_utc IS NULL")
            .HasDatabaseName(
                "ux_hive_stays_active_hive");
    }
}