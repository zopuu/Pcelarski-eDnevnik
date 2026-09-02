namespace PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;

public sealed class Colony {
    private Colony() {
    }

    private Colony(
        Guid ownerBeekeeperId,
        ColonyOrigin? origin,
        DateOnly? formedOn,
        string? notes) {
        if (ownerBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Owner beekeeper ID cannot be empty.",
                nameof(ownerBeekeeperId));
        }

        Id =
            Guid.NewGuid();

        OwnerBeekeeperId =
            ownerBeekeeperId;

        Origin =
            origin;

        Status =
            ColonyStatus.Active;
        CreatedAtUtc =
            DateTimeOffset.UtcNow;

        FormedOn =
            formedOn;

        Notes =
            NormalizeOptionalText(
                notes,
                ColonyRules.NotesMaxLength,
                nameof(notes));
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid OwnerBeekeeperId {
        get;
        private set;
    }

    public ColonyOrigin? Origin {
        get;
        private set;
    }

    public ColonyStatus Status {
        get;
        private set;
    }

    public DateOnly? FormedOn {
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

    public static Colony Create(
        Guid ownerBeekeeperId,
        ColonyOrigin? origin,
        DateOnly? formedOn,
        string? notes) {
        return new Colony(
            ownerBeekeeperId,
            origin,
            formedOn,
            notes);
    }

    public void Update(
        ColonyOrigin? origin,
        DateOnly? formedOn,
        string? notes) {
        Origin =
            origin;

        FormedOn =
            formedOn;
        UpdatedAtUtc =
            DateTimeOffset.UtcNow;

        Notes =
            NormalizeOptionalText(
                notes,
                ColonyRules.NotesMaxLength,
                nameof(notes));
    }

    public void MarkDead() {
        EnsureActive();

        Status =
            ColonyStatus.Dead;
        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public void MarkSplit() {
        EnsureActive();

        Status =
            ColonyStatus.Split;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void MarkMerged() {
        EnsureActive();

        Status =
            ColonyStatus.Merged;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private void EnsureActive() {
        if (Status !=
            ColonyStatus.Active) {
            throw new InvalidOperationException(
                "Only an active colony can change to a terminal status.");
        }
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