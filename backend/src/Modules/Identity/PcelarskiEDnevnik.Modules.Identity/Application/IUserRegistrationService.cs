namespace PcelarskiEDnevnik.Modules.Identity.Application;

public interface IUserRegistrationService {
    Task<UserRegistrationResult> CreateUserAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default);

    Task DeleteUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}