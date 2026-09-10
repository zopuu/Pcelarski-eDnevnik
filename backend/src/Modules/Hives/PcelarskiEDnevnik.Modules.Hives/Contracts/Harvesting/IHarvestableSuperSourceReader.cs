namespace PcelarskiEDnevnik.Modules.Hives.Contracts.Harvesting;

public interface IHarvestableSuperSourceReader {
    Task<IReadOnlyList<HarvestableSuperStaySource>>
        ReadAsync(
            Guid beekeeperId,
            CancellationToken cancellationToken);

    Task<IReadOnlyList<HarvestableSuperStaySource>>
        ReadByIdsAsync(
            Guid beekeeperId,
            IReadOnlyCollection<Guid> hiveSuperStayIds,
            CancellationToken cancellationToken);
}

public sealed record HarvestableSuperStaySource(
    Guid HiveSuperStayId,
    Guid HiveSuperId,
    Guid HiveId,
    string HiveLabel,
    DateOnly StartedOn,
    DateOnly EndedOn,
    int HarvestableFrameCount,
    int RemainingHarvestableFrameCount,
    IReadOnlyList<HiveStayHarvestSource> HiveStays);

public sealed record HiveStayHarvestSource(
    Guid Id,
    Guid HiveId,
    Guid ApiaryId,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc);