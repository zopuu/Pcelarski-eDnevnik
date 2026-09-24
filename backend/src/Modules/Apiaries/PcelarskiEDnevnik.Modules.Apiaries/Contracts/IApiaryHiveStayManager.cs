namespace PcelarskiEDnevnik.Modules.Apiaries.Contracts;

public interface IApiaryHiveStayManager {
    Task EndActiveHiveStaysAsync(
        Guid apiaryId,
        Guid beekeeperId,
        DateTimeOffset endedAtUtc,
        CancellationToken cancellationToken);
}
