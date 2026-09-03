using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles;

public sealed record ForageProfileItemResponse(
    Guid Id,
    ForageType ForageType,
    decimal Percentage,
    short Intensity,
    string? Notes);
