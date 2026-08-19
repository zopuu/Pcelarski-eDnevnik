namespace PcelarskiEDnevnik.Modules.Apiaries.Contracts;

public interface IApiaryAccessChecker {
    Task<bool> CanAccessAsync(
        Guid apiaryId,
        Guid beekeeperId,
        CancellationToken cancellationToken);
}