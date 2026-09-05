namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.GetAll;

public sealed record LocationListItemResponse(
    Guid Id,
    string? Name,
    decimal Latitude,
    decimal Longitude,
    int? AltitudeMeters,
    string? CadastralParcelNumber,
    string? Description);
