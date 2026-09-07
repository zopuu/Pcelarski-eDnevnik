namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

public static class PattyFeedingCalculator {
    public static int CalculateMassG(
        int pattyMassG,
        decimal percentage) {
        if (pattyMassG <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(pattyMassG),
                "Patty mass must be positive.");
        }

        if (percentage <= 0 ||
            percentage >
                PattyFeedingRules.MaximumPercentage) {
            throw new ArgumentOutOfRangeException(
                nameof(percentage),
                $"Percentage must be greater than zero and at most {PattyFeedingRules.MaximumPercentage}.");
        }

        var massG =
            decimal.Round(
                pattyMassG *
                percentage /
                100m,
                0,
                MidpointRounding.AwayFromZero);

        return checked((int)massG);
    }
}
