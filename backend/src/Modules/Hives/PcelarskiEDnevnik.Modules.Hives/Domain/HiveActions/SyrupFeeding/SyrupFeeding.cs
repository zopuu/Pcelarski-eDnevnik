namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SyrupFeeding;

public sealed class SyrupFeeding : HiveAction {
    private SyrupFeeding() {
    }

    private SyrupFeeding(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        int quantityMl,
        decimal sugarParts,
        decimal waterParts,
        string? additives)
        : base(
            HiveActionType.SyrupFeeding,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes) {
        if (quantityMl <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(quantityMl),
                "Syrup quantity must be positive.");
        }

        SyrupFeedingCalculator.ValidateRatio(
            sugarParts,
            waterParts);

        QuantityMl =
            quantityMl;

        SugarParts =
            sugarParts;

        WaterParts =
            waterParts;

        Additives =
            NormalizeAdditives(
                additives);
    }

    public int QuantityMl {
        get;
        private set;
    }

    public decimal SugarParts {
        get;
        private set;
    }

    public decimal WaterParts {
        get;
        private set;
    }

    public string? Additives {
        get;
        private set;
    }

    public static SyrupFeeding Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        int quantityMl,
        decimal sugarParts,
        decimal waterParts,
        string? additives) {
        return new SyrupFeeding(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes,
            quantityMl,
            sugarParts,
            waterParts,
            additives);
    }

    private static string? NormalizeAdditives(
        string? value) {
        if (string.IsNullOrWhiteSpace(
            value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (normalized.Length >
            SyrupFeedingRules.AdditivesMaxLength) {
            throw new ArgumentException(
                $"Additives cannot exceed {SyrupFeedingRules.AdditivesMaxLength} characters.",
                nameof(value));
        }

        return normalized;
    }
}
