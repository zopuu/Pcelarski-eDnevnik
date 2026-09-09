using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInspection;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections.Record;

public sealed record RecordHiveInspectionResponse(
    Guid ActionId,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    HiveInspectionType? InspectionType);
