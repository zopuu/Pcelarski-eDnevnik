using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Deactivate;

public sealed class DeactivateApiaryHandler(
    ICurrentBeekeeperContext currentBeekeeper,
    ApiariesDbContext dbContext,
    IApiaryHiveStayManager hiveStayManager) {
    public async Task<DeactivateApiaryResponse?> HandleAsync(
        DeactivateApiaryCommand command,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper.GetBeekeeperIdAsync(
                cancellationToken);

        await using var transaction =
            await BeginTransactionAsync(cancellationToken);

        try {
            // Serialize deactivation with whole-apiary relocation before
            // selecting the active stay.
            var apiary = dbContext.Database.IsRelational()
                ? await dbContext.Apiaries
                    .FromSqlInterpolated($"""
                        SELECT * FROM apiaries.apiaries
                        WHERE id = {command.ApiaryId}
                          AND owner_beekeeper_id = {beekeeperId}
                        FOR UPDATE
                        """)
                    .SingleOrDefaultAsync(cancellationToken)
                : await dbContext.Apiaries.SingleOrDefaultAsync(
                    x => x.Id == command.ApiaryId &&
                         x.OwnerBeekeeperId == beekeeperId,
                    cancellationToken);

            if (apiary is null) {
                return null;
            }

            if (apiary.Status == ApiaryStatus.Inactive) {
                throw new ConflictException(
                    "apiaries.already_inactive",
                    "The apiary is already inactive.");
            }

            // Wait for any layout PUT and recheck the active predicate.
            var activeApiaryStay = dbContext.Database.IsRelational()
                ? await dbContext.ApiaryStays
                    .FromSqlInterpolated($"""
                        SELECT * FROM apiaries.apiary_stays
                        WHERE apiary_id = {command.ApiaryId}
                          AND ended_at_utc IS NULL
                        FOR UPDATE
                        """)
                    .SingleOrDefaultAsync(cancellationToken)
                : await dbContext.ApiaryStays.SingleOrDefaultAsync(
                    x => x.ApiaryId == command.ApiaryId &&
                         x.EndedAtUtc == null,
                    cancellationToken);

            var deactivatedAtUtc = DateTimeOffset.UtcNow;

            if (activeApiaryStay is not null &&
                deactivatedAtUtc <= activeApiaryStay.StartedAtUtc) {
                deactivatedAtUtc =
                    activeApiaryStay.StartedAtUtc.AddTicks(1);
            }

            activeApiaryStay?.Close(deactivatedAtUtc);
            apiary.Deactivate(deactivatedAtUtc);

            await hiveStayManager.EndActiveHiveStaysAsync(
                apiary.Id,
                beekeeperId,
                deactivatedAtUtc,
                cancellationToken);

            await dbContext.SaveChangesAsync(cancellationToken);

            if (transaction is not null) {
                await transaction.CommitAsync(cancellationToken);
            }

            return new DeactivateApiaryResponse(
                apiary.Id,
                apiary.Status,
                deactivatedAtUtc);
        }
        catch {
            if (transaction is not null) {
                await transaction.RollbackAsync(cancellationToken);
            }

            throw;
        }
    }

    private async Task<IDbContextTransaction?> BeginTransactionAsync(
        CancellationToken cancellationToken) {
        if (!dbContext.Database.IsRelational()) {
            return null;
        }

        return await dbContext.Database.BeginTransactionAsync(
            cancellationToken);
    }
}
