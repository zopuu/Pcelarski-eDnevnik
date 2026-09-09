using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInspection;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections.Record;

public sealed record RecordHiveInspectionRequest
    : IValidatableObject {
    [Required(ErrorMessage = "Inspection date is required.")]
    public DateTimeOffset? PerformedAt { get; init; }

    [EnumDataType(typeof(HiveInspectionType), ErrorMessage = "Invalid inspection type.")]
    public HiveInspectionType? InspectionType { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? OverallConditionRating { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? PopulationRating { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? TemperamentRating { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? ColonyStrength { get; init; }

    [Range(HiveInspectionRules.MinimumCount, HiveInspectionRules.MaximumCount)]
    public short? BeeCoveredFrameCount { get; init; }

    [Range(HiveInspectionRules.MinimumCount, HiveInspectionRules.MaximumCount)]
    public short? BroodFrameCount { get; init; }

    [Range(HiveInspectionRules.MinimumCount, HiveInspectionRules.MaximumCount)]
    public short? HoneyFrameCount { get; init; }

    [Range(HiveInspectionRules.MinimumCount, HiveInspectionRules.MaximumCount)]
    public short? PollenFrameCount { get; init; }

    public bool? HasSwarmed { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? HoneyStoresRating { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? PollenStoresRating { get; init; }

    [Range(
        HiveInspectionRules.MinimumBroodCoveragePercentage,
        HiveInspectionRules.MaximumBroodCoveragePercentage)]
    public int? BroodCoveragePercentage { get; init; }

    [Range(HiveInspectionRules.MinimumCount, HiveInspectionRules.MaximumCount)]
    public short? OpenBroodFrameCount { get; init; }

    [Range(HiveInspectionRules.MinimumCount, HiveInspectionRules.MaximumCount)]
    public short? CappedBroodFrameCount { get; init; }

    [EnumDataType(typeof(BroodPattern), ErrorMessage = "Invalid brood pattern.")]
    public BroodPattern? BroodPattern { get; init; }

    [EnumDataType(typeof(BroodStage), ErrorMessage = "Invalid brood stage.")]
    public BroodStage? BroodStage { get; init; }

    public bool? DroneBroodPresent { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? DroneBroodExtent { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? LarvaePresence { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? DroneWorkerBalance { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? BroodQuality { get; init; }

    public bool? QueenSeen { get; init; }
    public bool? QueenMarked { get; init; }

    [Range(HiveInspectionRules.MinimumCount, HiveInspectionRules.MaximumCount)]
    public short? QueenCellCount { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? QueenCellStage { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? SwarmingTendency { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? FoodStoreAssessment { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? PollenStoreAssessment { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? StarvationRisk { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? VarroaLevel { get; init; }

    [EnumDataType(typeof(HiveDisease), ErrorMessage = "Invalid disease.")]
    public HiveDisease? Disease { get; init; }
    public string? DiseaseOther { get; init; }

    [EnumDataType(typeof(HivePest), ErrorMessage = "Invalid pest.")]
    public HivePest? Pest { get; init; }
    public string? PestOther { get; init; }

    [EnumDataType(typeof(HivePredator), ErrorMessage = "Invalid predator.")]
    public HivePredator? Predator { get; init; }
    public string? PredatorOther { get; init; }

    public bool? MoldPresent { get; init; }
    public bool? ExcessMoisturePresent { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? DeadBeeLevel { get; init; }

    [Range(HiveInspectionRules.MinimumRating, HiveInspectionRules.MaximumRating)]
    public short? Odor { get; init; }

    [StringLength(
        HiveActionRules.ImageUrlMaxLength,
        ErrorMessage = "Image URL cannot exceed 255 characters.")]
    public string? ImageUrl { get; init; }

    [StringLength(
        HiveActionRules.NotesMaxLength,
        ErrorMessage = "Notes cannot exceed 1000 characters.")]
    public string? Notes { get; init; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
        if (PerformedAt == default(DateTimeOffset)) {
            yield return new ValidationResult(
                "Inspection date is required.",
                [nameof(PerformedAt)]);
        }

        foreach (var result in ValidateOtherDetail(
            Disease,
            HiveDisease.OTHER,
            DiseaseOther,
            nameof(Disease),
            nameof(DiseaseOther))) {
            yield return result;
        }

        foreach (var result in ValidateOtherDetail(
            Pest,
            HivePest.OTHER,
            PestOther,
            nameof(Pest),
            nameof(PestOther))) {
            yield return result;
        }

        foreach (var result in ValidateOtherDetail(
            Predator,
            HivePredator.OTHER,
            PredatorOther,
            nameof(Predator),
            nameof(PredatorOther))) {
            yield return result;
        }
    }

    internal HiveInspectionDetails ToDetails() =>
        new() {
            InspectionType = InspectionType,
            OverallConditionRating = OverallConditionRating,
            PopulationRating = PopulationRating,
            TemperamentRating = TemperamentRating,
            ColonyStrength = ColonyStrength,
            BeeCoveredFrameCount = BeeCoveredFrameCount,
            BroodFrameCount = BroodFrameCount,
            HoneyFrameCount = HoneyFrameCount,
            PollenFrameCount = PollenFrameCount,
            HasSwarmed = HasSwarmed,
            HoneyStoresRating = HoneyStoresRating,
            PollenStoresRating = PollenStoresRating,
            BroodCoveragePercentage = BroodCoveragePercentage,
            OpenBroodFrameCount = OpenBroodFrameCount,
            CappedBroodFrameCount = CappedBroodFrameCount,
            BroodPattern = BroodPattern,
            BroodStage = BroodStage,
            DroneBroodPresent = DroneBroodPresent,
            DroneBroodExtent = DroneBroodExtent,
            LarvaePresence = LarvaePresence,
            DroneWorkerBalance = DroneWorkerBalance,
            BroodQuality = BroodQuality,
            QueenSeen = QueenSeen,
            QueenMarked = QueenMarked,
            QueenCellCount = QueenCellCount,
            QueenCellStage = QueenCellStage,
            SwarmingTendency = SwarmingTendency,
            FoodStoreAssessment = FoodStoreAssessment,
            PollenStoreAssessment = PollenStoreAssessment,
            StarvationRisk = StarvationRisk,
            VarroaLevel = VarroaLevel,
            Disease = Disease,
            DiseaseOther = DiseaseOther,
            Pest = Pest,
            PestOther = PestOther,
            Predator = Predator,
            PredatorOther = PredatorOther,
            MoldPresent = MoldPresent,
            ExcessMoisturePresent = ExcessMoisturePresent,
            DeadBeeLevel = DeadBeeLevel,
            Odor = Odor
        };

    private static IEnumerable<ValidationResult> ValidateOtherDetail<TEnum>(
        TEnum? selection,
        TEnum otherValue,
        string? detail,
        string selectionMemberName,
        string detailMemberName)
        where TEnum : struct, Enum {
        if (selection is not null && !Enum.IsDefined(selection.Value)) {
            yield break;
        }

        var normalizedDetail =
            string.IsNullOrWhiteSpace(detail)
                ? null
                : detail.Trim();

        if (normalizedDetail?.Length > HiveInspectionRules.OtherDetailMaxLength) {
            yield return new ValidationResult(
                $"Custom detail cannot exceed {HiveInspectionRules.OtherDetailMaxLength} characters.",
                [detailMemberName]);
        }

        var isOther =
            selection.HasValue &&
            EqualityComparer<TEnum>.Default.Equals(
                selection.Value,
                otherValue);

        if (isOther && normalizedDetail is null) {
            yield return new ValidationResult(
                "Custom detail is required when OTHER is selected.",
                [detailMemberName]);
        }

        if (!isOther && normalizedDetail is not null) {
            yield return new ValidationResult(
                "Custom detail can only be provided when OTHER is selected.",
                [selectionMemberName, detailMemberName]);
        }
    }
}
