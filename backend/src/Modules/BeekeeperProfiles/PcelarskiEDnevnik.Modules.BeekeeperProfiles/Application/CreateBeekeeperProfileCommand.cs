namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Application;

public sealed record CreateBeekeeperProfileCommand(
    Guid UserId,
    string FirstName,
    string LastName,
    string? Hid,
    string? Phone,
    int? AgriculturalHoldingNumber);