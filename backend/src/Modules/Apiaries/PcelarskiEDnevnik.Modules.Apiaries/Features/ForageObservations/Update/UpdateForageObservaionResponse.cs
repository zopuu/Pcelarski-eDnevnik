using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.Update;

public sealed record UpdateForageObservationResponse(
    Guid Id,
    DateTimeOffset ObservedAt,
    ForageType ForageType,
    short Intensity,
    string? Notes,
    decimal Latitude,
    decimal Longitude,
    Guid? ForageProfileId,
    DateTimeOffset UpdatedAtUtc);