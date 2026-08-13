namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Application;

public enum BeekeeperProfileRegistrationError {
    UserAlreadyHasProfile,
    HidAlreadyExists,
    AgriculturalHoldingNumberAlreadyExists
}

public sealed record BeekeeperProfileRegistrationResult(
    Guid? ProfileId,
    BeekeeperProfileRegistrationError? Error) {
    public bool Succeeded => ProfileId.HasValue;

    public static BeekeeperProfileRegistrationResult Success(
        Guid profileId) =>
        new(profileId, null);

    public static BeekeeperProfileRegistrationResult Failure(
        BeekeeperProfileRegistrationError error) =>
        new(null, error);
}