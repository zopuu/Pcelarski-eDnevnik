using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.RemoveSupers;

public sealed record RemoveHiveSupersResponse(
    Guid SuperManagementId,
    Guid HiveId,
    IReadOnlyList<RemovedHiveSuperResponse> Supers);

public sealed record RemovedHiveSuperResponse(
    Guid HiveSuperId,
    Guid HiveSuperStayId,
    SuperManagementOperation Operation,
    HiveSuperStatus Status,
    int? HarvestableFrameCount);