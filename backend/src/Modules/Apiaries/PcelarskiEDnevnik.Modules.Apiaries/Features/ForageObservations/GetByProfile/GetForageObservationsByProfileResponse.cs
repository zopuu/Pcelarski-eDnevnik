namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetByProfile;

public sealed record
    GetForageObservationsByProfileResponse(
        Guid ForageProfileId,
        IReadOnlyList<ForageObservationListItemResponse> Items,
        int Page,
        int PageSize,
        bool HasMore);