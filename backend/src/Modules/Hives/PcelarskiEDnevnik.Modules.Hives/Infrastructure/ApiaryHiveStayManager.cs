using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure;

internal sealed class ApiaryHiveStayManager(
    ApiariesDbContext apiariesDbContext,
    HivesDbContext hivesDbContext)
    : IApiaryHiveStayManager {
    public async Task EndActiveHiveStaysAsync(
        Guid apiaryId,
        Guid beekeeperId,
        DateTimeOffset endedAtUtc,
        CancellationToken cancellationToken) {
        await EnlistInApiaryTransactionAsync(cancellationToken);

        var activeHiveStays =
            await hivesDbContext.HiveStays
                .Where(
                    x =>
                        x.ApiaryId == apiaryId &&
                        x.EndedAtUtc == null)
                .ToListAsync(cancellationToken);

        var hiveIds = activeHiveStays
            .Select(x => x.HiveId)
            .Distinct()
            .ToArray();

        var ownedHiveCount =
            await hivesDbContext.Hives.CountAsync(
                x =>
                    hiveIds.Contains(x.Id) &&
                    x.OwnerBeekeeperId == beekeeperId,
                cancellationToken);

        if (ownedHiveCount != hiveIds.Length) {
            throw new ConflictException(
                "apiaries.hive_stay_ownership_mismatch",
                "An active hive stay is not owned by the apiary owner.");
        }

        if (activeHiveStays.Any(x => x.StartedAtUtc > endedAtUtc)) {
            throw new ConflictException(
                "apiaries.deactivation_precedes_hive_stay",
                "The apiary cannot be deactivated before an active hive stay started.");
        }

        foreach (var hiveStay in activeHiveStays) {
            hiveStay.Close(endedAtUtc);
        }

        await hivesDbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnlistInApiaryTransactionAsync(
        CancellationToken cancellationToken) {
        if (!apiariesDbContext.Database.IsRelational()) {
            return;
        }

        var apiaryTransaction =
            apiariesDbContext.Database.CurrentTransaction
            ?? throw new InvalidOperationException(
                "Apiary hive stays must be updated inside the apiary transaction.");

        hivesDbContext.Database.SetDbConnection(
            apiariesDbContext.Database.GetDbConnection(),
            contextOwnsConnection: false);

        await hivesDbContext.Database.UseTransactionAsync(
            apiaryTransaction.GetDbTransaction(),
            cancellationToken);
    }
}
