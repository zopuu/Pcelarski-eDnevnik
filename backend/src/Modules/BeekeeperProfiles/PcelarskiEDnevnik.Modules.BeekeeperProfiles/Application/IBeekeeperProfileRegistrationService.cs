namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Application;

public interface IBeekeeperProfileRegistrationService {
    Task<BeekeeperProfileRegistrationResult> CreateAsync(
        CreateBeekeeperProfileCommand command,
        CancellationToken cancellationToken = default);
}