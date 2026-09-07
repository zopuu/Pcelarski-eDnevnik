namespace PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.Record;

public sealed record RecordSyrupFeedingResponse(
    Guid? ActionGroupId,
    int AffectedHiveCount,
    int TotalSyrupMl,
    decimal EstimatedSugarKg,
    decimal EstimatedWaterKg,
    IReadOnlyList<RecordedSyrupFeedingResponse> Actions);

public sealed record RecordedSyrupFeedingResponse(
    Guid ActionId,
    Guid HiveId,
    int QuantityMl);
