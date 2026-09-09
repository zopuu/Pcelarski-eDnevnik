namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SyrupFeeding;

public static class SyrupFeedingRules {
    public const int AdditivesMaxLength =
        500;

    public const decimal
        EstimatedSyrupLitersPerTotalIngredientKilogram =
            0.8m;

    public const int IngredientEstimateDecimalPlaces =
        3;
}
