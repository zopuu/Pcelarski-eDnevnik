namespace PcelarskiEDnevnik.Modules.Identity.Application;

public sealed record UserRegistrationError(
    string Code,
    string Description);

public sealed record UserRegistrationResult(
    Guid? UserId,
    IReadOnlyCollection<UserRegistrationError> Errors) {
    public bool Succeeded => UserId.HasValue;

    public static UserRegistrationResult Success(Guid userId) =>
        new(userId, []);

    public static UserRegistrationResult Failure(
        IReadOnlyCollection<UserRegistrationError> errors) =>
        new(null, errors);
}