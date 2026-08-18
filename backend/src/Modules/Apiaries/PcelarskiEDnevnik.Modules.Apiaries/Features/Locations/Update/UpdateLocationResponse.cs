namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Update;

public sealed record UpdateLocationResponse(
    Guid Id,
    string? Name,
    decimal Latitude,
    decimal Longitude,
    int? AltitudeMeters,
    string? CadastralParcelNumber,
    string? Description,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);