using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles;

internal static class ForageProfileCurrentStayQuery {
    public static Task<Guid?> FindIdAsync(
        ApiariesDbContext dbContext,
        Guid apiaryId,
        Guid beekeeperId,
        CancellationToken cancellationToken) {
        return dbContext.ApiaryStays
            .AsNoTracking()
            .Where(
                stay =>
                    stay.ApiaryId == apiaryId &&
                    stay.EndedAtUtc == null &&
                    dbContext.Apiaries.Any(
                        apiary =>
                            apiary.Id == stay.ApiaryId &&
                            apiary.OwnerBeekeeperId == beekeeperId))
            .Select(stay => (Guid?)stay.Id)
            .SingleOrDefaultAsync(cancellationToken);
    }
}
