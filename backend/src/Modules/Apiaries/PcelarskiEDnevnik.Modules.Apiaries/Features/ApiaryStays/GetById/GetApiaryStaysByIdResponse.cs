using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetById;

public sealed record GetApiaryStayByIdResponse(
    Guid Id,
    Guid ApiaryId,
    Guid LocationId,
    string? LocationName,
    decimal Latitude,
    decimal Longitude,
    int? AltitudeMeters,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc,
    HiveEntranceOrientation? Orientation,
    string? Note,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);