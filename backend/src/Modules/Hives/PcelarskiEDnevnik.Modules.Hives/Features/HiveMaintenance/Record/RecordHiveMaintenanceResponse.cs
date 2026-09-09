using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Record;

public sealed record RecordHiveMaintenanceResponse(
    Guid ActionId,
    Guid HiveId,
    HiveMaintenanceType MaintenanceType,
    decimal? CostAmount,
    string? CurrencyCode,
    string? ServiceProvider,
    HiveStatus HiveStatus);
