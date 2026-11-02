using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure;

internal sealed class ApiaryActiveHiveReader(
    ApiariesDbContext apiariesDbContext,
    HivesDbContext dbContext)
    : IApiaryActiveHiveReader {
    public async Task<IReadOnlyList<ApiaryHiveInfo>> GetActiveHivesAsync(
        Guid beekeeperId,
        Guid apiaryId,
        CancellationToken cancellationToken) {
        // Share the Apiaries read transaction so membership and positions use one snapshot.
        var apiaryTransaction = apiariesDbContext.Database.CurrentTransaction;
        if (apiaryTransaction is not null) {
            dbContext.Database.SetDbConnection(
                apiariesDbContext.Database.GetDbConnection(),
                contextOwnsConnection: false);
            await dbContext.Database.UseTransactionAsync(
                apiaryTransaction.GetDbTransaction(),
                cancellationToken);
        }

        return await ActiveApiaryHivesQuery
            .ForApiary(dbContext, beekeeperId, apiaryId)
            .OrderBy(hive => hive.Label)
            .ThenBy(hive => hive.Id)
            .Select(hive => new ApiaryHiveInfo(
                hive.Id,
                hive.Label,
                hive.ColorHex,
                hive.Type.ToString()))
            .ToListAsync(cancellationToken);
    }
}
