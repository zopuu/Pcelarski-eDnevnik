using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence;

internal sealed class
    RelocationTransactionCoordinator {
    private readonly ApiariesDbContext
        _apiariesDbContext;

    private readonly HivesDbContext
        _hivesDbContext;

    private readonly RelocationsDbContext
        _relocationsDbContext;

    public RelocationTransactionCoordinator(
        ApiariesDbContext apiariesDbContext,
        HivesDbContext hivesDbContext,
        RelocationsDbContext
            relocationsDbContext) {
        _apiariesDbContext =
            apiariesDbContext;

        _hivesDbContext =
            hivesDbContext;

        _relocationsDbContext =
            relocationsDbContext;
    }

    public async Task<T> ExecuteAsync<T>(
        Func<
            CancellationToken,
            Task<T>> operation,
        CancellationToken
            cancellationToken) {
        var connection =
            _apiariesDbContext
                .Database
                .GetDbConnection();

        var shouldCloseConnection =
            connection.State !=
            ConnectionState.Open;

        if (shouldCloseConnection) {
            await _apiariesDbContext
                .Database
                .OpenConnectionAsync(
                    cancellationToken);
        }

        try {
            /*
             * Hives and Relocations must use
             * exactly the same physical
             * PostgreSQL connection.
             */
            _hivesDbContext
                .Database
                .SetDbConnection(
                    connection,
                    contextOwnsConnection:
                        false);

            _relocationsDbContext
                .Database
                .SetDbConnection(
                    connection,
                    contextOwnsConnection:
                        false);

            await using var transaction =
                await _apiariesDbContext
                    .Database
                    .BeginTransactionAsync(
                        cancellationToken);

            var dbTransaction =
                transaction
                    .GetDbTransaction();

            await _hivesDbContext
                .Database
                .UseTransactionAsync(
                    dbTransaction,
                    cancellationToken);

            await _relocationsDbContext
                .Database
                .UseTransactionAsync(
                    dbTransaction,
                    cancellationToken);

            try {
                var result =
                    await operation(
                        cancellationToken);

                await transaction
                    .CommitAsync(
                        cancellationToken);

                return result;
            }
            catch {
                await transaction
                    .RollbackAsync(
                        cancellationToken);

                throw;
            }
        }
        finally {
            if (shouldCloseConnection) {
                await _apiariesDbContext
                    .Database
                    .CloseConnectionAsync();
            }
        }
    }
}