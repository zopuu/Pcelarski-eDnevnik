using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetAvailable;

public sealed record AvailableQueenResponse(
    Guid Id,
    string? MarkingColorHex,
    QueenOrigin? Origin,
    string? Breeder,
    string? Breed,
    DateOnly? EmergedOn,
    DateOnly? AcquiredOn,
    string? Notes);
