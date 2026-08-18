using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Update;

public sealed record UpdateApiaryStayResponse(
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