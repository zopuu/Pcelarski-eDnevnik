namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed record ForageProfileItemInput(
    ForageType ForageType,
    decimal Percentage,
    short Intensity,
    string? Notes);
