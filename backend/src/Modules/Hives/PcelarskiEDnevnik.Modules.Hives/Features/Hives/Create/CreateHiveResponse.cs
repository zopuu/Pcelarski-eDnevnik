using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.Create;

public sealed record CreateHiveResponse(
    Guid Id,
    string? IdentificationNumber,
    string Label,
    HiveType Type,
    HiveStatus Status,
    bool HasFeeder,
    Guid CurrentApiaryId,
    Guid ActiveStayId,
    DateTimeOffset StayStartedAtUtc,
    DateTimeOffset CreatedAtUtc);