using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure;

internal sealed class ApiaryHistoryReader(
    ApiariesDbContext dbContext) : IApiaryHistoryReader {
    public async Task<IReadOnlyDictionary<Guid, ApiaryHistorySummary>>
        GetOwnedByIdsAsync(
            IReadOnlyCollection<Guid> apiaryIds,
            Guid beekeeperId,
            CancellationToken cancellationToken) {
        if (apiaryIds.Count == 0) {
            return new Dictionary<Guid, ApiaryHistorySummary>();
        }

        return await dbContext.Apiaries
            .AsNoTracking()
            .Where(x =>
                apiaryIds.Contains(x.Id) &&
                x.OwnerBeekeeperId == beekeeperId)
            .Select(x => new ApiaryHistorySummary(
                x.Id,
                x.Name,
                x.ImagePath == null
                    ? null
                    : "/uploads/" + x.ImagePath))
            .ToDictionaryAsync(
                x => x.Id,
                cancellationToken);
    }
}
