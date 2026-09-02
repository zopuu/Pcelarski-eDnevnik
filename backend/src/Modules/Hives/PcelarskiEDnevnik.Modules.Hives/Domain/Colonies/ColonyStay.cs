namespace PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;

public sealed class ColonyStay {
    private ColonyStay() {
    }

    private ColonyStay(
        Guid colonyId,
        Guid hiveId,
        DateOnly startedOn,
        string? notes) {
        if (colonyId == Guid.Empty) {
            throw new ArgumentException(
                "Colony ID cannot be empty.",
                nameof(colonyId));
        }

        if (hiveId == Guid.Empty) {
            throw new ArgumentException(
                "Hive ID cannot be empty.",
                nameof(hiveId));
        }

        Id =
            Guid.NewGuid();

        ColonyId =
            colonyId;

        HiveId =
            hiveId;

        StartedOn =
            startedOn;

        EndedOn =
            null;

        Notes =
            NormalizeOptionalText(
                notes,
                ColonyStayRules.NotesMaxLength,
                nameof(notes));
        CreatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid ColonyId {
        get;
        private set;
    }

    public Guid HiveId {
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

    public string? Notes {
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

    public static ColonyStay Start(
        Guid colonyId,
        Guid hiveId,
        DateOnly startedOn,
        string? notes) {
        return new ColonyStay(
            colonyId,
            hiveId,
            startedOn,
            notes);
    }

    public void End(
        DateOnly endedOn) {
        if (EndedOn is not null) {
            throw new InvalidOperationException(
                "Colony stay has already ended.");
        }

        if (endedOn < StartedOn) {
            throw new ArgumentException(
                "End date cannot be before start date.",
                nameof(endedOn));
        }

        EndedOn =
            endedOn;
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