using System.Buffers.Binary;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;

internal sealed class HarvestWriteTransaction(
    HarvestsDbContext dbContext) {
    public async Task<T> ExecuteAsync<T>(
        Guid beekeeperId,
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken) {
        await using var transaction =
            await dbContext.Database
                .BeginTransactionAsync(
                    cancellationToken);

        try {
            await AcquireBeekeeperLockAsync(
                beekeeperId,
                transaction,
                cancellationToken);

            var result =
                await action(
                    cancellationToken);

            await dbContext.SaveChangesAsync(
                cancellationToken);

            await transaction.CommitAsync(
                cancellationToken);

            return result;
        }
        catch {
            await transaction.RollbackAsync(
                cancellationToken);

            throw;
        }
    }

    private async Task
        AcquireBeekeeperLockAsync(
            Guid beekeeperId,
            IDbContextTransaction transaction,
            CancellationToken cancellationToken) {
        var connection =
            dbContext.Database
                .GetDbConnection();

        await using var command =
            connection.CreateCommand();

        command.Transaction =
            transaction.GetDbTransaction();

        command.CommandText =
            """
            SELECT pg_advisory_xact_lock(@lock_key);
            """;

        var parameter =
            command.CreateParameter();

        parameter.ParameterName =
            "lock_key";

        parameter.Value =
            CreateLockKey(
                beekeeperId);

        command.Parameters.Add(
            parameter);

        await command.ExecuteNonQueryAsync(
            cancellationToken);
    }

    private static long CreateLockKey(
        Guid beekeeperId) {
        Span<byte> bytes =
            stackalloc byte[16];

        beekeeperId.TryWriteBytes(
            bytes);

        return BinaryPrimitives
            .ReadInt64LittleEndian(
                bytes[..8]);
    }
}