using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetAll;

public sealed record ApiaryStayListItemResponse(
    Guid Id,
    Guid LocationId,
    string? LocationName,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc,
    HiveEntranceOrientation? Orientation,
    bool IsActive);