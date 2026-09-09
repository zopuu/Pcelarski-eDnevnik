using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.GetHiveSupers;

public sealed record GetHiveSupersResponse(
    Guid Id,
    HiveType Type,
    int FrameCount,
    HiveSuperStatus Status,
    string? ColorHex,
    Guid StayId,
    DateOnly StartedOn);