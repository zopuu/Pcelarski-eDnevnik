namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetAll;

public sealed record GetForageObservationsResponse(
    IReadOnlyList<ForageObservationListItemResponse> Items,
    int Page,
    int PageSize,
    bool HasMore);