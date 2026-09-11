using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Finalize;

internal sealed class FinalizeHoneyBatchHandler(
    HarvestsDbContext dbContext) {
    public async Task<FinalizeHoneyBatchResponse?>
        HandleAsync(
            Guid beekeeperId,
            Guid batchId,
            CancellationToken cancellationToken) {
        var batch =
            await dbContext.HoneyBatches
                .SingleOrDefaultAsync(
                    x =>
                        x.Id == batchId
                        &&
                        x.OwnerBeekeeperId ==
                        beekeeperId,
                    cancellationToken);

        if (batch is null) {
            return null;
        }

        batch.FinalizeBatch();

        await dbContext.SaveChangesAsync(
            cancellationToken);

        return new FinalizeHoneyBatchResponse(
            batch.Id,
            batch.Status.ToString(),
            batch.BatchCode,
            batch.TotalAmount,
            batch.Unit,
            batch.PeriodStartedOn,
            batch.PeriodEndedOn);
    }
}
