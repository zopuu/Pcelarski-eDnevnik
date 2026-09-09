namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.PattyFeeding;

public sealed class PattyFeeding : HiveAction {
    private PattyFeeding() {
    }

    private PattyFeeding(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        int massG,
        PattyType pattyType,
        string? manufacturer)
        : base(
            HiveActionType.PattyFeeding,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes) {
        if (massG <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(massG),
                "Patty mass must be positive.");
        }

        if (!Enum.IsDefined(
                pattyType)) {
            throw new ArgumentOutOfRangeException(
                nameof(pattyType));
        }

        MassG =
            massG;

        PattyType =
            pattyType;

        Manufacturer =
            NormalizeManufacturer(
                manufacturer);
    }

    public int MassG {
        get;
        private set;
    }

    public PattyType PattyType {
        get;
        private set;
    }

    public string? Manufacturer {
        get;
        private set;
    }

    public static PattyFeeding Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        int massG,
        PattyType pattyType,
        string? manufacturer) {
        return new PattyFeeding(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes,
            massG,
            pattyType,
            manufacturer);
    }

    private static string? NormalizeManufacturer(
        string? value) {
        if (string.IsNullOrWhiteSpace(
            value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (normalized.Length >
            PattyFeedingRules.ManufacturerMaxLength) {
            throw new ArgumentException(
                $"Manufacturer cannot exceed {PattyFeedingRules.ManufacturerMaxLength} characters.",
                nameof(value));
        }

        return normalized;
    }
}
