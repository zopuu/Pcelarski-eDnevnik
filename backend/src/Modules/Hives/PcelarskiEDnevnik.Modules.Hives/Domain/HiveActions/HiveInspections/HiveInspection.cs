namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInspection;

public sealed class HiveInspection : HiveAction {
    private HiveInspection() {
    }

    private HiveInspection(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        string? imageUrl,
        string? notes,
        HiveInspectionDetails details)
        : base(
            HiveActionType.Inspection,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId: null,
            imageUrl,
            notes) {
        var normalizedDetails =
            HiveInspectionRules.NormalizeAndValidate(details);

        InspectionType = normalizedDetails.InspectionType;
        OverallConditionRating = normalizedDetails.OverallConditionRating;
        PopulationRating = normalizedDetails.PopulationRating;
        TemperamentRating = normalizedDetails.TemperamentRating;
        ColonyStrength = normalizedDetails.ColonyStrength;
        BeeCoveredFrameCount = normalizedDetails.BeeCoveredFrameCount;
        BroodFrameCount = normalizedDetails.BroodFrameCount;
        HoneyFrameCount = normalizedDetails.HoneyFrameCount;
        PollenFrameCount = normalizedDetails.PollenFrameCount;
        HasSwarmed = normalizedDetails.HasSwarmed;
        HoneyStoresRating = normalizedDetails.HoneyStoresRating;
        PollenStoresRating = normalizedDetails.PollenStoresRating;
        BroodCoveragePercentage = normalizedDetails.BroodCoveragePercentage;
        OpenBroodFrameCount = normalizedDetails.OpenBroodFrameCount;
        CappedBroodFrameCount = normalizedDetails.CappedBroodFrameCount;
        BroodPattern = normalizedDetails.BroodPattern;
        BroodStage = normalizedDetails.BroodStage;
        DroneBroodPresent = normalizedDetails.DroneBroodPresent;
        DroneBroodExtent = normalizedDetails.DroneBroodExtent;
        LarvaePresence = normalizedDetails.LarvaePresence;
        DroneWorkerBalance = normalizedDetails.DroneWorkerBalance;
        BroodQuality = normalizedDetails.BroodQuality;
        QueenSeen = normalizedDetails.QueenSeen;
        QueenMarked = normalizedDetails.QueenMarked;
        QueenCellCount = normalizedDetails.QueenCellCount;
        QueenCellStage = normalizedDetails.QueenCellStage;
        SwarmingTendency = normalizedDetails.SwarmingTendency;
        FoodStoreAssessment = normalizedDetails.FoodStoreAssessment;
        PollenStoreAssessment = normalizedDetails.PollenStoreAssessment;
        StarvationRisk = normalizedDetails.StarvationRisk;
        VarroaLevel = normalizedDetails.VarroaLevel;
        Disease = normalizedDetails.Disease;
        DiseaseOther = normalizedDetails.DiseaseOther;
        Pest = normalizedDetails.Pest;
        PestOther = normalizedDetails.PestOther;
        Predator = normalizedDetails.Predator;
        PredatorOther = normalizedDetails.PredatorOther;
        MoldPresent = normalizedDetails.MoldPresent;
        ExcessMoisturePresent = normalizedDetails.ExcessMoisturePresent;
        DeadBeeLevel = normalizedDetails.DeadBeeLevel;
        Odor = normalizedDetails.Odor;
    }

    public HiveInspectionType? InspectionType { get; private set; }
    public short? OverallConditionRating { get; private set; }
    public short? PopulationRating { get; private set; }
    public short? TemperamentRating { get; private set; }
    public short? ColonyStrength { get; private set; }
    public short? BeeCoveredFrameCount { get; private set; }
    public short? BroodFrameCount { get; private set; }
    public short? HoneyFrameCount { get; private set; }
    public short? PollenFrameCount { get; private set; }
    public bool? HasSwarmed { get; private set; }
    public short? HoneyStoresRating { get; private set; }
    public short? PollenStoresRating { get; private set; }
    public int? BroodCoveragePercentage { get; private set; }
    public short? OpenBroodFrameCount { get; private set; }
    public short? CappedBroodFrameCount { get; private set; }
    public BroodPattern? BroodPattern { get; private set; }
    public BroodStage? BroodStage { get; private set; }
    public bool? DroneBroodPresent { get; private set; }
    public short? DroneBroodExtent { get; private set; }
    public short? LarvaePresence { get; private set; }
    public short? DroneWorkerBalance { get; private set; }
    public short? BroodQuality { get; private set; }
    public bool? QueenSeen { get; private set; }
    public bool? QueenMarked { get; private set; }
    public short? QueenCellCount { get; private set; }
    public short? QueenCellStage { get; private set; }
    public short? SwarmingTendency { get; private set; }
    public short? FoodStoreAssessment { get; private set; }
    public short? PollenStoreAssessment { get; private set; }
    public short? StarvationRisk { get; private set; }
    public short? VarroaLevel { get; private set; }
    public HiveDisease? Disease { get; private set; }
    public string? DiseaseOther { get; private set; }
    public HivePest? Pest { get; private set; }
    public string? PestOther { get; private set; }
    public HivePredator? Predator { get; private set; }
    public string? PredatorOther { get; private set; }
    public bool? MoldPresent { get; private set; }
    public bool? ExcessMoisturePresent { get; private set; }
    public short? DeadBeeLevel { get; private set; }
    public short? Odor { get; private set; }

    public static HiveInspection Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        string? imageUrl,
        string? notes,
        HiveInspectionDetails details) {
        return new HiveInspection(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            imageUrl,
            notes,
            details);
    }
}
