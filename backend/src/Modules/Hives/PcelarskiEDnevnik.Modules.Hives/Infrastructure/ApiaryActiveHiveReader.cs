using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure;

internal sealed class ApiaryActiveHiveReader(HivesDbContext dbContext)
    : IApiaryActiveHiveReader {
    public async Task<IReadOnlyList<ApiaryHiveInfo>> GetActiveHivesAsync(
        Guid beekeeperId,
        Guid apiaryId,
        CancellationToken cancellationToken) =>
        await ActiveApiaryHivesQuery
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
