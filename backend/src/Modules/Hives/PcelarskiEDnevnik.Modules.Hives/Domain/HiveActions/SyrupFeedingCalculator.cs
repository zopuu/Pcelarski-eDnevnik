namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

public static class SyrupFeedingCalculator {
    public static int CalculateQuantityMl(
        int feederCapacityMl,
        decimal fillPercentage) {
        if (feederCapacityMl <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(feederCapacityMl),
                "Feeder capacity must be positive.");
        }

        if (fillPercentage <= 0 ||
            fillPercentage > 100) {
            throw new ArgumentOutOfRangeException(
                nameof(fillPercentage),
                "Fill percentage must be greater than zero and at most 100.");
        }

        var quantityMl =
            decimal.Round(
                feederCapacityMl *
                fillPercentage /
                100m,
                0,
                MidpointRounding.AwayFromZero);

        return checked((int)quantityMl);
    }

    public static SyrupIngredientEstimate
        CalculateIngredientEstimate(
            int totalSyrupMl,
            decimal sugarParts,
            decimal waterParts) {
        if (totalSyrupMl <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(totalSyrupMl),
                "Total syrup quantity must be positive.");
        }

        ValidateRatio(
            sugarParts,
            waterParts);

        var syrupLiters =
            totalSyrupMl /
            1000m;

        var totalIngredientKg =
            syrupLiters /
            SyrupFeedingRules
                .EstimatedSyrupLitersPerTotalIngredientKilogram;

        var totalParts =
            sugarParts +
            waterParts;

        return new SyrupIngredientEstimate(
            RoundIngredientEstimate(
                totalIngredientKg *
                sugarParts /
                totalParts),
            RoundIngredientEstimate(
                totalIngredientKg *
                waterParts /
                totalParts));
    }

    public static void ValidateRatio(
        decimal sugarParts,
        decimal waterParts) {
        if (sugarParts <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(sugarParts),
                "Sugar parts must be positive.");
        }

        if (waterParts <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(waterParts),
                "Water parts must be positive.");
        }
    }

    private static decimal RoundIngredientEstimate(
        decimal value) {
        return decimal.Round(
            value,
            SyrupFeedingRules
                .IngredientEstimateDecimalPlaces,
            MidpointRounding.AwayFromZero);
    }
}

public sealed record SyrupIngredientEstimate(
    decimal EstimatedSugarKg,
    decimal EstimatedWaterKg);
