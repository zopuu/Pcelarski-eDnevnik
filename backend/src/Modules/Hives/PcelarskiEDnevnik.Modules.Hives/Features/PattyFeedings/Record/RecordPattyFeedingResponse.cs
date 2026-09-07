namespace PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.Record;

public sealed record RecordPattyFeedingResponse(
    Guid? ActionGroupId,
    int AffectedHiveCount,
    int TotalMassG);
