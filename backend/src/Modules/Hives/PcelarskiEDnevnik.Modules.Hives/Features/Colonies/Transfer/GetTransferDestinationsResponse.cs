using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Transfer;

public sealed record GetTransferDestinationsResponse(
    Guid Id,
    string Label,
    string? IdentificationNumber,
    HiveType Type,
    string? ColorHex,
    HiveStatus Status);
