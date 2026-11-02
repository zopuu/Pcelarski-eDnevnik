using System.Data;
using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure;

internal sealed class ApiaryHiveCreationLayoutUpdater(ApiariesDbContext dbContext)
    : IApiaryHiveCreationLayoutUpdater {
    public async Task<T> ExecuteAsync<T>(
        Guid apiaryId,
        Guid beekeeperId,
        Func<DbConnection, DbTransaction, CancellationToken, Task<T>> createHive,
        CancellationToken cancellationToken) {
        ArgumentNullException.ThrowIfNull(createHive);

        var connection = dbContext.Database.GetDbConnection();
        var shouldCloseConnection = connection.State != ConnectionState.Open;
        if (shouldCloseConnection) {
            await dbContext.Database.OpenConnectionAsync(cancellationToken);
        }

        try {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(
                cancellationToken);

            var ownedActiveApiary = await dbContext.Apiaries
                .AsNoTracking()
                .AnyAsync(apiary =>
                    apiary.Id == apiaryId &&
                    apiary.OwnerBeekeeperId == beekeeperId &&
                    apiary.Status == ApiaryStatus.Active,
                    cancellationToken);
            if (!ownedActiveApiary) {
                throw new NotFoundException(
                    "apiaries.layout_not_found",
                    "The apiary layout was not found.");
            }

            // Match layout PUT and selected-hive relocation: active stay before layout.
            // The active predicate is rechecked after any competing stay lock releases.
            var stay = await ApiaryLayoutLocks.LockActiveStayAsync(
                dbContext, apiaryId, cancellationToken)
                ?? throw new ConflictException(
                    "apiaries.layout_no_active_stay",
                    "The apiary has no active stay.");

            var layout = await ApiaryLayoutLocks.LockLayoutForStayAsync(
                dbContext, stay.Id, cancellationToken)
                ?? throw new InvalidOperationException(
                    "An active apiary stay has no layout.");

            var result = await createHive(
                connection,
                transaction.GetDbTransaction(),
                cancellationToken);

            // A new active member is deliberately unplaced. No positions are loaded
            // or created; the version invalidates editors with an older membership.
            layout.ApplyMembershipChange(Array.Empty<Guid>());
            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return result;
        }
        finally {
            if (shouldCloseConnection) {
                await dbContext.Database.CloseConnectionAsync();
            }
        }
    }
}
