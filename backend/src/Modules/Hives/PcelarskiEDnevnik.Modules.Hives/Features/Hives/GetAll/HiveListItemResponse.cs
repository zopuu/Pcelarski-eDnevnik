using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.GetAll;

public sealed record HiveListItemResponse(
    Guid Id,
    string? IdentificationNumber,
    string Label,
    HiveType Type,
    HiveStatus Status);