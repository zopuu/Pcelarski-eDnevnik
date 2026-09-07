using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure;

internal sealed class ApiaryAccessChecker(
    ApiariesDbContext dbContext)
    : IApiaryAccessChecker {
    public Task<bool> CanAccessAsync(
        Guid apiaryId,
        Guid beekeeperId,
        CancellationToken cancellationToken) {
        return dbContext.Apiaries
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.Id == apiaryId &&
                    x.OwnerBeekeeperId == beekeeperId &&
                    x.Status == PcelarskiEDnevnik.Modules.Apiaries.Domain.ApiaryStatus.Active,
                cancellationToken);
    }
}
