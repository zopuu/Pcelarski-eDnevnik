namespace PcelarskiEDnevnik.Modules.Apiaries.Contracts;

public interface IApiaryHistoryReader {
    Task<IReadOnlyDictionary<Guid, ApiaryHistorySummary>>
        GetOwnedByIdsAsync(
            IReadOnlyCollection<Guid> apiaryIds,
            Guid beekeeperId,
            CancellationToken cancellationToken);
}

public sealed record ApiaryHistorySummary(
    Guid Id,
    string Name,
    string? ImageUrl);
