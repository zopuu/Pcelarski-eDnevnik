namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetById;

public sealed record GetLocationByIdResponse(
    Guid Id,
    string? Name,
    decimal Latitude,
    decimal Longitude,
    int? AltitudeMeters,
    string? CadastralParcelNumber,
    string? Description,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);