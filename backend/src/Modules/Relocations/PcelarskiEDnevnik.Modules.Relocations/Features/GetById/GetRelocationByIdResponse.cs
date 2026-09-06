using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Relocations.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Features.GetById;

public sealed record GetRelocationByIdResponse(
    Guid Id,
    RelocationKind Kind,
    DateTimeOffset OccurredAtUtc,
    RelocationTransportMethod TransportMethod,
    decimal? DistanceKm,
    decimal? CostAmount,
    string? CurrencyCode,
    string? Notes,
    int? HiveCount,
    RelocationPlaceResponse Origin,
    RelocationPlaceResponse Destination);

public sealed record RelocationPlaceResponse(
    RelocationApiaryResponse Apiary,
    RelocationApiaryStayResponse Stay,
    RelocationLocationResponse Location);

public sealed record RelocationApiaryResponse(
    Guid Id,
    string IdentificationNumber,
    string? Name);

public sealed record RelocationApiaryStayResponse(
    Guid Id,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc,
    HiveEntranceOrientation? Orientation,
    string? Note);

public sealed record RelocationLocationResponse(
    Guid Id,
    string? Name,
    string? Description,
    int? AltitudeMeters,
    string? CadastralParcelNumber,
    decimal Latitude,
    decimal Longitude);
