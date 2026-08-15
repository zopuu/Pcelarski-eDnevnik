namespace PcelarskiEDnevnik.SharedKernel.Authentication;

public interface ICurrentBeekeeperContext {
    Task<Guid> GetBeekeeperIdAsync(
        CancellationToken cancellationToken = default);
}