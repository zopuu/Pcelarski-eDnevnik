using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInsulation;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation;

internal static class HiveInsulationStateReader {
    public static async Task<IReadOnlyList<
        HiveInsulationState>> ReadOwnedAsync(
            HivesDbContext dbContext,
            Guid beekeeperId,
            Guid[] hiveIds,
            DateTimeOffset? asOf,
            CancellationToken cancellationToken) {
        return await dbContext.Hives
            .AsNoTracking()
            .Where(
                hive =>
                    hiveIds.Contains(
                        hive.Id) &&
                    hive.OwnerBeekeeperId ==
                        beekeeperId)
            .Select(
                hive =>
                    new HiveInsulationState(
                        hive.Id,
                        dbContext.HiveInsulations
                            .AsNoTracking()
                            .Where(
                                action =>
                                    action.HiveId ==
                                        hive.Id &&
                                    action.Paper &&
                                    (asOf == null ||
                                     action.PerformedAt <=
                                     asOf.Value))
                            .OrderByDescending(
                                action =>
                                    action.PerformedAt)
                            .Select(
                                action =>
                                    (HiveInsulationOperation?)
                                    action.Operation)
                            .FirstOrDefault(),
                        dbContext.HiveInsulations
                            .AsNoTracking()
                            .Where(
                                action =>
                                    action.HiveId ==
                                        hive.Id &&
                                    action.Paper)
                            .Select(
                                action =>
                                    (DateTimeOffset?)
                                    action.PerformedAt)
                            .Max(),
                        dbContext.HiveInsulations
                            .AsNoTracking()
                            .Where(
                                action =>
                                    action.HiveId ==
                                        hive.Id &&
                                    action.Eps &&
                                    (asOf == null ||
                                     action.PerformedAt <=
                                     asOf.Value))
                            .OrderByDescending(
                                action =>
                                    action.PerformedAt)
                            .Select(
                                action =>
                                    (HiveInsulationOperation?)
                                    action.Operation)
                            .FirstOrDefault(),
                        dbContext.HiveInsulations
                            .AsNoTracking()
                            .Where(
                                action =>
                                    action.HiveId ==
                                        hive.Id &&
                                    action.Eps)
                            .Select(
                                action =>
                                    (DateTimeOffset?)
                                    action.PerformedAt)
                            .Max(),
                        dbContext.HiveInsulations
                            .AsNoTracking()
                            .Where(
                                action =>
                                    action.HiveId ==
                                        hive.Id &&
                                    action.Xps &&
                                    (asOf == null ||
                                     action.PerformedAt <=
                                     asOf.Value))
                            .OrderByDescending(
                                action =>
                                    action.PerformedAt)
                            .Select(
                                action =>
                                    (HiveInsulationOperation?)
                                    action.Operation)
                            .FirstOrDefault(),
                        dbContext.HiveInsulations
                            .AsNoTracking()
                            .Where(
                                action =>
                                    action.HiveId ==
                                        hive.Id &&
                                    action.Xps)
                            .Select(
                                action =>
                                    (DateTimeOffset?)
                                    action.PerformedAt)
                            .Max()))
            .ToListAsync(
                cancellationToken);
    }
}

internal sealed record HiveInsulationState(
    Guid HiveId,
    HiveInsulationOperation? PaperOperation,
    DateTimeOffset? LatestPaperPerformedAt,
    HiveInsulationOperation? EpsOperation,
    DateTimeOffset? LatestEpsPerformedAt,
    HiveInsulationOperation? XpsOperation,
    DateTimeOffset? LatestXpsPerformedAt) {
    public bool Paper =>
        PaperOperation ==
        HiveInsulationOperation.Add;

    public bool Eps =>
        EpsOperation ==
        HiveInsulationOperation.Add;

    public bool Xps =>
        XpsOperation ==
        HiveInsulationOperation.Add;
}
