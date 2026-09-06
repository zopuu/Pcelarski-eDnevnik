using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.Update;

public sealed record UpdateHiveResponse(
    Guid Id,
    string? IdentificationNumber,
    string Label,
    HiveType Type,
    string? ColorHex,
    HiveStatus Status,
    DateOnly? ManufactureDate,
    string? Manufacturer,
    HiveMaterial? Material,
    DateOnly? PurchaseDate,
    bool HasFeeder,
    int? FeederVolumeMl,
    string? Note,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
