public sealed record GetMyProfileResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string? Hid,
    string? Phone,
    int? AgriculturalHoldingNumber);