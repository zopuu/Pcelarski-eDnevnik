using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetStays;

public sealed record GetQueenStaysPageResponse(
    IReadOnlyList<QueenStayHistoryItemResponse> Items,
    int Page,
    bool HasNextPage);

public sealed record QueenStayHistoryItemResponse(
    Guid Id,
    DateOnly StartedOn,
    DateOnly? EndedOn,
    ColonyOrigin? ColonyOrigin,
    DateOnly? ColonyFormedOn,
    QueenIntroductionMethod? IntroductionMethod,
    QueenIntroductionOutcome? IntroductionOutcome,
    string? Notes,
    IReadOnlyList<QueenStayHiveResponse> Hives);

public sealed record QueenStayHiveResponse(
    Guid Id,
    string Label,
    string? ColorHex);
