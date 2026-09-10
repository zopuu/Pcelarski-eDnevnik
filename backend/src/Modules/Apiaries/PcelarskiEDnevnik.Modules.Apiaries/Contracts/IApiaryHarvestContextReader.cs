namespace PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;

public interface IApiaryHarvestContextReader {
    Task<ApiaryHarvestContextSource>
        ReadAsync(
            Guid beekeeperId,
            IReadOnlyCollection<Guid> apiaryIds,
            DateOnly startedOn,
            DateOnly endedOn,
            CancellationToken cancellationToken);
}

public sealed record ApiaryHarvestContextSource(
    IReadOnlyList<ApiaryStayHarvestSource> ApiaryStays,
    IReadOnlyList<ApiaryLocationHarvestSource> Locations,
    IReadOnlyList<ForageProfileHarvestSource>
        ForageProfiles);

public sealed record ApiaryStayHarvestSource(
    Guid Id,
    Guid ApiaryId,
    Guid LocationId,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc);

public sealed record ApiaryLocationHarvestSource(
    Guid Id,
    string? Name,
    decimal Latitude,
    decimal Longitude);

public sealed record ForageProfileHarvestSource(
    Guid Id,
    Guid ApiaryStayId,
    int Year,
    IReadOnlyList<ForageProfileItemHarvestSource> Items);

public sealed record ForageProfileItemHarvestSource(
    string ForageType,
    decimal Percentage);