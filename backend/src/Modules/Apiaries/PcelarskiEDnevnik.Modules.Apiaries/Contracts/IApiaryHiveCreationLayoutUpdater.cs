using System.Data.Common;

namespace PcelarskiEDnevnik.Modules.Apiaries.Contracts;

public interface IApiaryHiveCreationLayoutUpdater {
    // The callback enlists the Hives DbContext in this connection and transaction.
    // It must persist the hive and active stay before the layout version advances.
    Task<T> ExecuteAsync<T>(
        Guid apiaryId,
        Guid beekeeperId,
        Func<DbConnection, DbTransaction, CancellationToken, Task<T>> createHive,
        CancellationToken cancellationToken);
}
