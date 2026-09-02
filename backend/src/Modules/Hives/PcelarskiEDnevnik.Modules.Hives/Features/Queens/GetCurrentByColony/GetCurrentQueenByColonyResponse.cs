using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetCurrentByColony;

public sealed record GetCurrentQueenByColonyResponse(
    Guid Id,
    string? MarkingColorHex,
    QueenOrigin? Origin,
    string? Breeder,
    string? Breed,
    QueenStatus Status,
    DateOnly? EmergedOn,
    DateOnly? AcquiredOn,
    string? Notes,
    Guid StayId,
    DateOnly StartedOn,
    QueenIntroductionMethod? IntroductionMethod,
    QueenIntroductionOutcome? IntroductionOutcome,
    string? StayNotes);