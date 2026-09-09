namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance;

public static class HiveMaintenanceRules {
    public const int MaintenanceTypeMaxLength = 30;
    public const int CurrencyCodeLength = 3;
    public const int ServiceProviderMaxLength = 100;
    public const int CostPrecision = 12;
    public const int CostScale = 2;
    public const decimal MaximumCostAmount =
        9_999_999_999.99m;
    public const string CurrencyCodePattern =
        "^[A-Z]{3}$";

    public static bool HasSupportedCostScale(
        decimal value) {
        return decimal.Round(
                value,
                CostScale) ==
            value;
    }
}
