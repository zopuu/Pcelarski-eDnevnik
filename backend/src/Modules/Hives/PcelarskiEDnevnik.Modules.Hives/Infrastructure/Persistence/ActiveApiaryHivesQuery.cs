using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

internal static class ActiveApiaryHivesQuery {
    public static IQueryable<Hive> ForApiary(
        HivesDbContext dbContext,
        Guid beekeeperId,
        Guid apiaryId) =>
        dbContext.Hives
            .AsNoTracking()
            .Where(hive =>
                hive.OwnerBeekeeperId == beekeeperId &&
                dbContext.HiveStays.Any(stay =>
                    stay.HiveId == hive.Id &&
                    stay.ApiaryId == apiaryId &&
                    stay.EndedAtUtc == null));
}
