namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles;

public sealed record ForageProfileResponse(
    Guid Id,
    int Year,
    short? RadiusKm,
    string Name,
    string? Notes,
    bool IsLocked,
    Guid ApiaryStayId,
    IReadOnlyCollection<ForageProfileItemResponse> Items);
