namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.Record;

public sealed record RecordHiveInsulationResponse(
    Guid? ActionGroupId,
    IReadOnlyList<
        RecordedHiveInsulationResponse> Actions);

public sealed record RecordedHiveInsulationResponse(
    Guid ActionId,
    Guid HiveId);
