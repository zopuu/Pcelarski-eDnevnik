using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.Update;

public sealed record UpdateQueenResponse(
    Guid Id,
    string? MarkingColorHex,
    QueenOrigin? Origin,
    string? Breeder,
    string? Breed,
    QueenStatus Status,
    DateOnly? EmergedOn,
    DateOnly? AcquiredOn,
    string? Notes,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);