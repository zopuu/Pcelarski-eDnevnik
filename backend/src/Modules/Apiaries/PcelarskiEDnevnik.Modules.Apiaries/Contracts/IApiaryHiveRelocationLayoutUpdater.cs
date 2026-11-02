namespace PcelarskiEDnevnik.Modules.Apiaries.Contracts;

public sealed record HiveRelocationApiaryStays(
    Guid SourceStayId,
    DateTimeOffset SourceStartedAtUtc,
    Guid DestinationStayId,
    DateTimeOffset DestinationStartedAtUtc);

public interface IApiaryHiveRelocationLayoutUpdater {
    // The caller must verify ownership of both apiaries and hold the shared
    // relocation transaction through both calls.
    Task<HiveRelocationApiaryStays> LockCurrentLayoutsAsync(
        Guid sourceApiaryId,
        Guid destinationApiaryId,
        CancellationToken cancellationToken);

    Task ApplyHiveTransferAsync(
        HiveRelocationApiaryStays stays,
        IReadOnlyCollection<Guid> hiveIds,
        CancellationToken cancellationToken);
}
