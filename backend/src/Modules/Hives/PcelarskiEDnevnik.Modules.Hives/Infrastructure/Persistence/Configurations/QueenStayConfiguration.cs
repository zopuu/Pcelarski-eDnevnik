using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class QueenStayConfiguration
    : IEntityTypeConfiguration<QueenStay> {
    public void Configure(
        EntityTypeBuilder<QueenStay> builder) {
        builder.ToTable(
            "queen_stays",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_queen_stays_dates",
                    """
                    "ended_on" IS NULL
                    OR "ended_on" >= "started_on"
                    """);

                table.HasCheckConstraint(
                    "ck_queen_stays_introduction_method",
                    """
                    "introduction_method" IN (
                        'Placement',
                        'Caged',
                        'Direct',
                        'Unknown',
                        'Other'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_queen_stays_introduction_outcome",
                    """
                    "introduction_outcome" IS NULL
                    OR "introduction_outcome" IN (
                        'Accepted',
                        'Killed',
                        'Missing',
                        'Unverified',
                        'Other'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_queen_stays_end_reason",
                    """
                    "end_reason" IS NULL
                    OR "end_reason" IN (
                        'Replaced',
                        'Dead',
                        'Killed',
                        'Missing',
                        'Removed',
                        'Swarmed',
                        'ColonyEnded',
                        'Other',
                        'Transferred',
                        'ColonyWithoutQueen'
                    )
                    """);
            });

        builder.HasKey(
            x => x.Id);

        builder.Property(
                x => x.Id)
            .HasColumnName(
                "id");

        builder.Property(
                x => x.QueenId)
            .HasColumnName(
                "queen_id")
            .IsRequired();

        builder.Property(
                x => x.ColonyId)
            .HasColumnName(
                "colony_id")
            .IsRequired();

        builder.Property(
                x => x.StartedOn)
            .HasColumnName(
                "started_on")
            .IsRequired();

        builder.Property(
                x => x.EndedOn)
            .HasColumnName(
                "ended_on");

        builder.Property(
                x => x.IntroductionMethod)
            .HasColumnName(
                "introduction_method")
            .HasConversion<string>()
            .HasMaxLength(
                QueenStayRules
                    .IntroductionMethodMaxLength)
            .IsRequired();

        builder.Property(
                x => x.IntroductionOutcome)
            .HasColumnName(
                "introduction_outcome")
            .HasConversion<string>()
            .HasMaxLength(
                QueenStayRules
                    .IntroductionOutcomeMaxLength);

        builder.Property(
                x => x.Notes)
            .HasColumnName(
                "notes")
            .HasMaxLength(
                QueenStayRules.NotesMaxLength);

        builder.Property(
                x => x.EndReason)
            .HasColumnName(
                "end_reason")
            .HasConversion<string>()
            .HasMaxLength(
                QueenStayRules.EndReasonMaxLength);

        builder.Property(
                x => x.CreatedAtUtc)
            .HasColumnName(
                "created_at_utc")
            .IsRequired();

        builder.Property(
                x => x.UpdatedAtUtc)
            .HasColumnName(
                "updated_at_utc");

        /*
         * One queen can belong to at most
         * one colony at a time.
         */
        builder.HasIndex(
                x => x.QueenId)
            .IsUnique()
            .HasFilter(
                "\"ended_on\" IS NULL")
            .HasDatabaseName(
                "ux_queen_stays_active_queen");

        /*
         * One colony can have at most
         * one active queen.
         */
        builder.HasIndex(
                x => x.ColonyId)
            .IsUnique()
            .HasFilter(
                "\"ended_on\" IS NULL")
            .HasDatabaseName(
                "ux_queen_stays_active_colony");

        builder.HasIndex(
                x => new {
                    x.QueenId,
                    x.StartedOn
                })
            .HasDatabaseName(
                "ix_queen_stays_queen_started_on");

        builder.HasIndex(
                x => new {
                    x.ColonyId,
                    x.StartedOn
                })
            .HasDatabaseName(
                "ix_queen_stays_colony_started_on");

        builder.HasOne<Queen>()
            .WithMany()
            .HasForeignKey(
                x => x.QueenId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.HasOne<Colony>()
            .WithMany()
            .HasForeignKey(
                x => x.ColonyId)
            .OnDelete(
                DeleteBehavior.Restrict);
    }
}
