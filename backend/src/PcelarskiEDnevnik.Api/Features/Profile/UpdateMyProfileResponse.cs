namespace PcelarskiEDnevnik.Api.Features.Profile;

public sealed record UpdateMyProfileResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Hid,
    string? Phone,
    int? AgriculturalHoldingNumber);
