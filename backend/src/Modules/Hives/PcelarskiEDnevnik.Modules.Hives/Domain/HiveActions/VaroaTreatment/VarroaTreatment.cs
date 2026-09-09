namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.VaroaTreatment;

public sealed class VarroaTreatment : HiveAction {
    private VarroaTreatment() {
    }

    private VarroaTreatment(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        string productName,
        VarroaApplicationMethod applicationMethod,
        decimal doseAmount,
        VarroaDoseUnit doseUnit)
        : base(
            HiveActionType.VarroaTreatment,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes) {
        if (doseAmount <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(doseAmount),
                "Dose amount must be positive.");
        }

        if (!Enum.IsDefined(
                applicationMethod)) {
            throw new ArgumentOutOfRangeException(
                nameof(applicationMethod));
        }

        if (!Enum.IsDefined(
                doseUnit)) {
            throw new ArgumentOutOfRangeException(
                nameof(doseUnit));
        }

        ProductName =
            NormalizeProductName(
                productName);

        ApplicationMethod =
            applicationMethod;

        DoseAmount =
            doseAmount;

        DoseUnit =
            doseUnit;
    }

    public string ProductName {
        get;
        private set;
    } = null!;

    public VarroaApplicationMethod ApplicationMethod {
        get;
        private set;
    }

    public decimal DoseAmount {
        get;
        private set;
    }

    public VarroaDoseUnit DoseUnit {
        get;
        private set;
    }

    public static VarroaTreatment Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        string productName,
        VarroaApplicationMethod applicationMethod,
        decimal doseAmount,
        VarroaDoseUnit doseUnit) {
        return new VarroaTreatment(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes,
            productName,
            applicationMethod,
            doseAmount,
            doseUnit);
    }

    private static string NormalizeProductName(
        string value) {
        if (string.IsNullOrWhiteSpace(
            value)) {
            throw new ArgumentException(
                "Product name is required.",
                nameof(value));
        }

        var normalized =
            value.Trim();

        if (normalized.Length >
            VarroaTreatmentRules.ProductNameMaxLength) {
            throw new ArgumentException(
                $"Product name cannot exceed {VarroaTreatmentRules.ProductNameMaxLength} characters.",
                nameof(value));
        }

        return normalized;
    }
}
