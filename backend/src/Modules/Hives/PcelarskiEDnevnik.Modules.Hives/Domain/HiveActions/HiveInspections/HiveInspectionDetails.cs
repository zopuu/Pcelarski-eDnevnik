namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInspection;

public sealed record HiveInspectionDetails {
    public HiveInspectionType? InspectionType { get; init; }
    public short? OverallConditionRating { get; init; }
    public short? PopulationRating { get; init; }
    public short? TemperamentRating { get; init; }
    public short? ColonyStrength { get; init; }
    public short? BeeCoveredFrameCount { get; init; }
    public short? BroodFrameCount { get; init; }
    public short? HoneyFrameCount { get; init; }
    public short? PollenFrameCount { get; init; }
    public bool? HasSwarmed { get; init; }
    public short? HoneyStoresRating { get; init; }
    public short? PollenStoresRating { get; init; }
    public int? BroodCoveragePercentage { get; init; }
    public short? OpenBroodFrameCount { get; init; }
    public short? CappedBroodFrameCount { get; init; }
    public BroodPattern? BroodPattern { get; init; }
    public BroodStage? BroodStage { get; init; }
    public bool? DroneBroodPresent { get; init; }
    public short? DroneBroodExtent { get; init; }
    public short? LarvaePresence { get; init; }
    public short? DroneWorkerBalance { get; init; }
    public short? BroodQuality { get; init; }
    public bool? QueenSeen { get; init; }
    public bool? QueenMarked { get; init; }
    public short? QueenCellCount { get; init; }
    public short? QueenCellStage { get; init; }
    public short? SwarmingTendency { get; init; }
    public short? FoodStoreAssessment { get; init; }
    public short? PollenStoreAssessment { get; init; }
    public short? StarvationRisk { get; init; }
    public short? VarroaLevel { get; init; }
    public HiveDisease? Disease { get; init; }
    public string? DiseaseOther { get; init; }
    public HivePest? Pest { get; init; }
    public string? PestOther { get; init; }
    public HivePredator? Predator { get; init; }
    public string? PredatorOther { get; init; }
    public bool? MoldPresent { get; init; }
    public bool? ExcessMoisturePresent { get; init; }
    public short? DeadBeeLevel { get; init; }
    public short? Odor { get; init; }
}
