using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Update;

public sealed record UpdateColonyResponse(
    Guid Id,
    ColonyOrigin? Origin,
    ColonyStatus Status,
    DateOnly? FormedOn,
    string? Notes);