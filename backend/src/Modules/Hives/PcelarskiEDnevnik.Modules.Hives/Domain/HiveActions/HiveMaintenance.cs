namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

public sealed class HiveMaintenance : HiveAction {
    private HiveMaintenance() {
    }

    private HiveMaintenance(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        string? imageUrl,
        string? notes,
        HiveMaintenanceType maintenanceType,
        decimal? costAmount,
        string? currencyCode,
        string? serviceProvider)
        : base(
            HiveActionType.Maintenance,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId: null,
            imageUrl,
            notes) {
        UpdateDetails(
            maintenanceType,
            costAmount,
            currencyCode,
            serviceProvider);
    }

    public HiveMaintenanceType MaintenanceType {
        get;
        private set;
    }

    public decimal? CostAmount {
        get;
        private set;
    }

    public string? CurrencyCode {
        get;
        private set;
    }

    public string? ServiceProvider {
        get;
        private set;
    }

    public static HiveMaintenance Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        string? imageUrl,
        string? notes,
        HiveMaintenanceType maintenanceType,
        decimal? costAmount,
        string? currencyCode,
        string? serviceProvider) {
        return new HiveMaintenance(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            imageUrl,
            notes,
            maintenanceType,
            costAmount,
            currencyCode,
            serviceProvider);
    }

    public void UpdateDetails(
        HiveMaintenanceType maintenanceType,
        decimal? costAmount,
        string? currencyCode,
        string? serviceProvider) {
        if (!Enum.IsDefined(
                maintenanceType)) {
            throw new ArgumentOutOfRangeException(
                nameof(maintenanceType));
        }

        var normalizedCurrencyCode =
            NormalizeCurrencyCode(
                currencyCode);

        ValidateCost(
            costAmount);

        if (costAmount.HasValue !=
            (normalizedCurrencyCode is not null)) {
            throw new ArgumentException(
                "Cost amount and currency code must either both be provided or both be omitted.");
        }

        MaintenanceType =
            maintenanceType;

        CostAmount =
            costAmount;

        CurrencyCode =
            normalizedCurrencyCode;

        ServiceProvider =
            NormalizeServiceProvider(
                serviceProvider);
    }

    private static void ValidateCost(
        decimal? costAmount) {
        if (costAmount is null) {
            return;
        }

        if (costAmount < 0 ||
            costAmount >
                HiveMaintenanceRules
                    .MaximumCostAmount) {
            throw new ArgumentOutOfRangeException(
                nameof(costAmount),
                $"Cost amount must be between 0 and {HiveMaintenanceRules.MaximumCostAmount}.");
        }

        if (!HiveMaintenanceRules
                .HasSupportedCostScale(
                    costAmount.Value)) {
            throw new ArgumentException(
                $"Cost amount cannot have more than {HiveMaintenanceRules.CostScale} decimal places.",
                nameof(costAmount));
        }
    }

    private static string? NormalizeCurrencyCode(
        string? value) {
        if (string.IsNullOrWhiteSpace(
                value)) {
            return null;
        }

        var normalized =
            value.Trim()
                .ToUpperInvariant();

        if (!System.Text.RegularExpressions.Regex.IsMatch(
                normalized,
                HiveMaintenanceRules
                    .CurrencyCodePattern,
                System.Text.RegularExpressions.RegexOptions
                    .CultureInvariant)) {
            throw new ArgumentException(
                "Currency code must contain exactly three ASCII letters.",
                nameof(value));
        }

        return normalized;
    }

    private static string? NormalizeServiceProvider(
        string? value) {
        if (string.IsNullOrWhiteSpace(
                value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (normalized.Length >
            HiveMaintenanceRules
                .ServiceProviderMaxLength) {
            throw new ArgumentException(
                $"Service provider cannot exceed {HiveMaintenanceRules.ServiceProviderMaxLength} characters.",
                nameof(value));
        }

        return normalized;
    }
}
