using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetById;

public sealed record GetForageObservationByIdResponse(
    Guid Id,
    DateTimeOffset ObservedAt,
    ForageType ForageType,
    short Intensity,
    string? Notes,
    decimal Latitude,
    decimal Longitude,
    Guid? ForageProfileId,
    string? ForageProfileName,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);