using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.AddSupers;

public sealed record AddHiveSupersResponse(
    Guid SuperManagementId,
    Guid HiveId,
    int AddedSupersCount,
    IReadOnlyList<AddedHiveSuperResponse> Supers);

public sealed record AddedHiveSuperResponse(
    Guid HiveSuperId,
    Guid HiveSuperStayId,
    HiveType Type,
    HiveSuperStatus Status,
    int FrameCount,
    string ColorHex);