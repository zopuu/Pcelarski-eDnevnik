using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetCurrent;

public sealed record GetCurrentApiaryStayResponse(
    Guid Id,
    Guid ApiaryId,
    Guid LocationId,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc,
    HiveEntranceOrientation? Orientation,
    string? Note,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);