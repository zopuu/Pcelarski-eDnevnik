using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Update;

public sealed record UpdateHiveMaintenanceResponse(
    Guid ActionId,
    Guid HiveId,
    HiveMaintenanceType MaintenanceType,
    decimal? CostAmount,
    string? CurrencyCode,
    string? ServiceProvider);
