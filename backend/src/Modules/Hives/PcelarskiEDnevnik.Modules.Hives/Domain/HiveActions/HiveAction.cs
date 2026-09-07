namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

public abstract class HiveAction {
    protected HiveAction() {
    }

    protected HiveAction(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes) {
        if (hiveId == Guid.Empty) {
            throw new ArgumentException(
                "Hive ID cannot be empty.",
                nameof(hiveId));
        }

        if (performedByBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Performing beekeeper ID cannot be empty.",
                nameof(performedByBeekeeperId));
        }

        Id =
            Guid.NewGuid();

        HiveId =
            hiveId;

        PerformedAt =
            performedAt;

        PerformedByBeekeeperId =
            performedByBeekeeperId;

        ActionGroupId =
            actionGroupId;

        ImageUrl =
            NormalizeOptionalText(
                imageUrl,
                HiveActionRules.ImageUrlMaxLength,
                nameof(imageUrl));

        Notes =
            NormalizeOptionalText(
                notes,
                HiveActionRules.NotesMaxLength,
                nameof(notes));
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid HiveId {
        get;
        private set;
    }

    public DateTimeOffset PerformedAt {
        get;
        private set;
    }

    public Guid PerformedByBeekeeperId {
        get;
        private set;
    }

    public Guid? ActionGroupId {
        get;
        private set;
    }

    public string? ImageUrl {
        get;
        private set;
    }

    public string? Notes {
        get;
        private set;
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
