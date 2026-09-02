namespace PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

public sealed class QueenStay {
    private QueenStay() {
    }

    private QueenStay(
        Guid queenId,
        Guid colonyId,
        DateOnly startedOn,
        QueenIntroductionMethod? introductionMethod,
        QueenIntroductionOutcome? introductionOutcome,
        string? notes) {
        if (queenId == Guid.Empty) {
            throw new ArgumentException(
                "Queen ID cannot be empty.",
                nameof(queenId));
        }

        if (colonyId == Guid.Empty) {
            throw new ArgumentException(
                "Colony ID cannot be empty.",
                nameof(colonyId));
        }

        Id =
            Guid.NewGuid();

        QueenId =
            queenId;

        ColonyId =
            colonyId;

        StartedOn =
            startedOn;

        EndedOn =
            null;

        IntroductionMethod =
            introductionMethod;

        IntroductionOutcome =
            introductionOutcome;

        Notes =
            NormalizeOptionalText(
                notes,
                QueenStayRules.NotesMaxLength,
                nameof(notes));

        EndReason =
            null;

        CreatedAtUtc =
            DateTimeOffset.UtcNow;

        UpdatedAtUtc =
            null;
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid QueenId {
        get;
        private set;
    }

    public Guid ColonyId {
        get;
        private set;
    }

    public DateOnly StartedOn {
        get;
        private set;
    }

    public DateOnly? EndedOn {
        get;
        private set;
    }

    public QueenIntroductionMethod? IntroductionMethod {
        get;
        private set;
    }

    public QueenIntroductionOutcome? IntroductionOutcome {
        get;
        private set;
    }

    public string? Notes {
        get;
        private set;
    }

    public QueenStayEndReason? EndReason {
        get;
        private set;
    }

    public DateTimeOffset CreatedAtUtc {
        get;
        private set;
    }

    public DateTimeOffset? UpdatedAtUtc {
        get;
        private set;
    }

    public static QueenStay Start(
        Guid queenId,
        Guid colonyId,
        DateOnly startedOn,
        QueenIntroductionMethod? introductionMethod,
        QueenIntroductionOutcome? introductionOutcome,
        string? notes) {
        return new QueenStay(
            queenId,
            colonyId,
            startedOn,
            introductionMethod,
            introductionOutcome,
            notes);
    }

    public void End(
        DateOnly endedOn,
        QueenStayEndReason endReason) {
        if (EndedOn is not null) {
            throw new InvalidOperationException(
                "Queen stay has already ended.");
        }

        if (endedOn < StartedOn) {
            throw new ArgumentException(
                "End date cannot be before start date.",
                nameof(endedOn));
        }

        EndedOn =
            endedOn;

        EndReason =
            endReason;

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public void UpdateIntroductionOutcome(
        QueenIntroductionOutcome? introductionOutcome) {
        if (EndedOn is not null) {
            throw new InvalidOperationException(
                "Cannot change introduction outcome after the queen stay has ended.");
        }

        IntroductionOutcome =
            introductionOutcome;

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    private static string?
        NormalizeOptionalText(
            string? value,
            int maxLength,
            string parameterName) {
        if (string.IsNullOrWhiteSpace(
            value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (normalized.Length >
            maxLength) {
            throw new ArgumentException(
                $"Value cannot exceed {maxLength} characters.",
                parameterName);
        }

        return normalized;
    }
}