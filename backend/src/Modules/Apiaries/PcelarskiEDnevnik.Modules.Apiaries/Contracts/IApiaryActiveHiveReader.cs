namespace PcelarskiEDnevnik.Modules.Apiaries.Contracts;

public interface IApiaryActiveHiveReader {
    // The caller authorizes the apiary and obtains beekeeperId from the server-side context.
    Task<IReadOnlyList<ApiaryHiveInfo>> GetActiveHivesAsync(
        Guid beekeeperId,
        Guid apiaryId,
        CancellationToken cancellationToken);
}

public sealed record ApiaryHiveInfo(
    Guid Id,
    string Label,
    string? ColorHex,
    string HiveType);
