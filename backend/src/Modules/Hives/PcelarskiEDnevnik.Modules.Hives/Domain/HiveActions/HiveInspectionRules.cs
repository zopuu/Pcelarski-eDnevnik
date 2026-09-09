namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

public static class HiveInspectionRules {
    public const int InspectionTypeMaxLength = 20;
    public const int BroodPatternMaxLength = 20;
    public const int BroodStageMaxLength = 20;
    public const int HealthFindingMaxLength = 30;
    public const int OtherDetailMaxLength = 100;
    public const int MinimumRating = 1;
    public const int MaximumRating = 5;
    public const int MinimumCount = 0;
    public const int MaximumCount = short.MaxValue;
    public const int MinimumBroodCoveragePercentage = 0;
    public const int MaximumBroodCoveragePercentage = 100;

    internal static HiveInspectionDetails NormalizeAndValidate(
        HiveInspectionDetails details) {
        ArgumentNullException.ThrowIfNull(details);

        EnsureDefined(details.InspectionType, nameof(details.InspectionType));
        EnsureDefined(details.BroodPattern, nameof(details.BroodPattern));
        EnsureDefined(details.BroodStage, nameof(details.BroodStage));
        EnsureDefined(details.Disease, nameof(details.Disease));
        EnsureDefined(details.Pest, nameof(details.Pest));
        EnsureDefined(details.Predator, nameof(details.Predator));

        EnsureRating(details.OverallConditionRating, nameof(details.OverallConditionRating));
        EnsureRating(details.PopulationRating, nameof(details.PopulationRating));
        EnsureRating(details.TemperamentRating, nameof(details.TemperamentRating));
        EnsureRating(details.ColonyStrength, nameof(details.ColonyStrength));
        EnsureRating(details.HoneyStoresRating, nameof(details.HoneyStoresRating));
        EnsureRating(details.PollenStoresRating, nameof(details.PollenStoresRating));
        EnsureRating(details.DroneBroodExtent, nameof(details.DroneBroodExtent));
        EnsureRating(details.LarvaePresence, nameof(details.LarvaePresence));
        EnsureRating(details.DroneWorkerBalance, nameof(details.DroneWorkerBalance));
        EnsureRating(details.BroodQuality, nameof(details.BroodQuality));
        EnsureRating(details.QueenCellStage, nameof(details.QueenCellStage));
        EnsureRating(details.SwarmingTendency, nameof(details.SwarmingTendency));
        EnsureRating(details.FoodStoreAssessment, nameof(details.FoodStoreAssessment));
        EnsureRating(details.PollenStoreAssessment, nameof(details.PollenStoreAssessment));
        EnsureRating(details.StarvationRisk, nameof(details.StarvationRisk));
        EnsureRating(details.VarroaLevel, nameof(details.VarroaLevel));
        EnsureRating(details.DeadBeeLevel, nameof(details.DeadBeeLevel));
        EnsureRating(details.Odor, nameof(details.Odor));

        EnsureCount(details.BeeCoveredFrameCount, nameof(details.BeeCoveredFrameCount));
        EnsureCount(details.BroodFrameCount, nameof(details.BroodFrameCount));
        EnsureCount(details.HoneyFrameCount, nameof(details.HoneyFrameCount));
        EnsureCount(details.PollenFrameCount, nameof(details.PollenFrameCount));
        EnsureCount(details.OpenBroodFrameCount, nameof(details.OpenBroodFrameCount));
        EnsureCount(details.CappedBroodFrameCount, nameof(details.CappedBroodFrameCount));
        EnsureCount(details.QueenCellCount, nameof(details.QueenCellCount));

        if (!IsBroodCoveragePercentageValid(
            details.BroodCoveragePercentage)) {
            throw new ArgumentOutOfRangeException(
                nameof(details.BroodCoveragePercentage),
                $"Brood coverage percentage must be between {MinimumBroodCoveragePercentage} and {MaximumBroodCoveragePercentage}.");
        }

        return details with {
            DiseaseOther = NormalizeOtherDetail(
                details.Disease,
                HiveDisease.OTHER,
                details.DiseaseOther,
                nameof(details.Disease),
                nameof(details.DiseaseOther)),
            PestOther = NormalizeOtherDetail(
                details.Pest,
                HivePest.OTHER,
                details.PestOther,
                nameof(details.Pest),
                nameof(details.PestOther)),
            PredatorOther = NormalizeOtherDetail(
                details.Predator,
                HivePredator.OTHER,
                details.PredatorOther,
                nameof(details.Predator),
                nameof(details.PredatorOther))
        };
    }

    public static bool IsRatingValid(short? value) =>
        value is null or >= MinimumRating and <= MaximumRating;

    public static bool IsCountValid(short? value) =>
        value is null or >= MinimumCount;

    public static bool IsBroodCoveragePercentageValid(int? value) =>
        value is null or >= MinimumBroodCoveragePercentage and <= MaximumBroodCoveragePercentage;

    private static void EnsureRating(short? value, string parameterName) {
        if (!IsRatingValid(value)) {
            throw new ArgumentOutOfRangeException(
                parameterName,
                $"Rating must be between {MinimumRating} and {MaximumRating}.");
        }
    }

    private static void EnsureCount(short? value, string parameterName) {
        if (!IsCountValid(value)) {
            throw new ArgumentOutOfRangeException(
                parameterName,
                "Count cannot be negative.");
        }
    }

    private static void EnsureDefined<TEnum>(
        TEnum? value,
        string parameterName)
        where TEnum : struct, Enum {
        if (value is not null && !Enum.IsDefined(value.Value)) {
            throw new ArgumentOutOfRangeException(parameterName);
        }
    }

    private static string? NormalizeOtherDetail<TEnum>(
        TEnum? selection,
        TEnum otherValue,
        string? detail,
        string selectionParameterName,
        string detailParameterName)
        where TEnum : struct, Enum {
        var normalizedDetail =
            string.IsNullOrWhiteSpace(detail)
                ? null
                : detail.Trim();

        if (normalizedDetail?.Length > OtherDetailMaxLength) {
            throw new ArgumentException(
                $"Custom detail cannot exceed {OtherDetailMaxLength} characters.",
                detailParameterName);
        }

        var isOther =
            selection.HasValue &&
            EqualityComparer<TEnum>.Default.Equals(selection.Value, otherValue);

        if (isOther && normalizedDetail is null) {
            throw new ArgumentException(
                "Custom detail is required when OTHER is selected.",
                detailParameterName);
        }

        if (!isOther && normalizedDetail is not null) {
            throw new ArgumentException(
                "Custom detail can only be provided when OTHER is selected.",
                selectionParameterName);
        }

        return normalizedDetail;
    }
}
