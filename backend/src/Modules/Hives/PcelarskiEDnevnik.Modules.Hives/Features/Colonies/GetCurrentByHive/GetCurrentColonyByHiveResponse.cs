using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.GetCurrentByHive;

public sealed record GetCurrentColonyByHiveResponse(
    Guid Id,
    ColonyOrigin? Origin,
    ColonyStatus Status,
    DateOnly? FormedOn,
    string? Notes,
    Guid StayId,
    DateOnly StartedOn,
    string? StayNotes);