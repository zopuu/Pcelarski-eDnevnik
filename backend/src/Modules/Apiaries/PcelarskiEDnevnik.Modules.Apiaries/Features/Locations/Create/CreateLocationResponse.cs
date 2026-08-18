namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Create;

public sealed record CreateLocationResponse(
    Guid Id,
    string? Name,
    decimal Latitude,
    decimal Longitude,
    int? AltitudeMeters,
    string? CadastralParcelNumber,
    string? Description,
    DateTimeOffset CreatedAtUtc);