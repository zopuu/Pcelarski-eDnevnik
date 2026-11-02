using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure;

internal static class ApiaryLayoutLocks {
    public static Task<ApiaryStay?> LockActiveStayAsync(
        ApiariesDbContext dbContext,
        Guid apiaryId,
        CancellationToken cancellationToken) =>
        dbContext.ApiaryStays
            .FromSqlInterpolated($"""
                SELECT * FROM apiaries.apiary_stays
                WHERE apiary_id = {apiaryId} AND ended_at_utc IS NULL
                FOR UPDATE
                """)
            .AsNoTracking()
            .SingleOrDefaultAsync(cancellationToken);

    public static Task<ApiaryLayout?> LockLayoutForStayAsync(
        ApiariesDbContext dbContext,
        Guid stayId,
        CancellationToken cancellationToken) =>
        dbContext.ApiaryLayouts
            .FromSqlInterpolated($"""
                SELECT * FROM apiaries.apiary_layouts
                WHERE apiary_stay_id = {stayId}
                FOR UPDATE
                """)
            .SingleOrDefaultAsync(cancellationToken);

    public static Task<ApiaryLayout?> LockLayoutByIdAsync(
        ApiariesDbContext dbContext,
        Guid layoutId,
        CancellationToken cancellationToken) =>
        dbContext.ApiaryLayouts
            .FromSqlInterpolated($"""
                SELECT * FROM apiaries.apiary_layouts
                WHERE id = {layoutId}
                FOR UPDATE
                """)
            .SingleOrDefaultAsync(cancellationToken);
}
