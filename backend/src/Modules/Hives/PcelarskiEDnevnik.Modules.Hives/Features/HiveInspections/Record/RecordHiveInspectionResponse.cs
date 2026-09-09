using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections.Record;

public sealed record RecordHiveInspectionResponse(
    Guid ActionId,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    HiveInspectionType? InspectionType);
