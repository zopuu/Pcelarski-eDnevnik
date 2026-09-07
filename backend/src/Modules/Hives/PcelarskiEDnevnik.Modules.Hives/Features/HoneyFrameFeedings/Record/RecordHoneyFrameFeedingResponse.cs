namespace PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings.Record;

public sealed record RecordHoneyFrameFeedingResponse(
    Guid? ActionGroupId,
    int AffectedHiveCount,
    int TotalFrameCount);
