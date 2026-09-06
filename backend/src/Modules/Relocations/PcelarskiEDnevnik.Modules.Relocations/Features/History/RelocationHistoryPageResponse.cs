using PcelarskiEDnevnik.Modules.Relocations.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Features.History;

public sealed record RelocationHistoryPageResponse(
    IReadOnlyList<RelocationHistoryItemResponse> Items,
    int Page,
    bool HasNextPage);

public sealed record RelocationHistoryItemResponse(
    Guid Id,
    RelocationKind Kind,
    DateTimeOffset OccurredAtUtc,
    string OriginLocationName,
    string DestinationLocationName,
    int? HiveCount,
    RelocationTransportMethod TransportMethod,
    decimal? DistanceKm,
    string? Notes);
