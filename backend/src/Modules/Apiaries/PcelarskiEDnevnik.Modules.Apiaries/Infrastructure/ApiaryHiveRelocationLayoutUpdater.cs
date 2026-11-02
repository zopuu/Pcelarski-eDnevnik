using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure;

internal sealed class ApiaryHiveRelocationLayoutUpdater(ApiariesDbContext dbContext)
    : IApiaryHiveRelocationLayoutUpdater {
    private HiveRelocationApiaryStays? _lockedStays;
    private ApiaryLayout? _sourceLayout;
    private ApiaryLayout? _destinationLayout;

    public async Task<HiveRelocationApiaryStays> LockCurrentLayoutsAsync(
        Guid sourceApiaryId,
        Guid destinationApiaryId,
        CancellationToken cancellationToken) {
        if (dbContext.Database.CurrentTransaction is null) {
            throw new InvalidOperationException(
                "Hive relocation layouts require the shared transaction.");
        }

        // Match layout PUT: lock active stays before layouts. All relocations
        // lock both stays and then both layouts in a deterministic order.
        var stays = new Dictionary<Guid, ApiaryStay>();
        foreach (var apiaryId in new[] { sourceApiaryId, destinationApiaryId }
                     .OrderBy(id => id)) {
            var stay = await dbContext.ApiaryStays
                .FromSqlInterpolated($"""
                    SELECT * FROM apiaries.apiary_stays
                    WHERE apiary_id = {apiaryId} AND ended_at_utc IS NULL
                    FOR UPDATE
                    """)
                .AsNoTracking()
                .SingleOrDefaultAsync(cancellationToken);

            if (stay is null) {
                throw new ConflictException(
                    apiaryId == sourceApiaryId
                        ? "relocations.source_apiary_has_no_active_stay"
                        : "relocations.destination_apiary_has_no_active_stay",
                    apiaryId == sourceApiaryId
                        ? "The source apiary has no active stay."
                        : "The destination apiary has no active stay.");
            }

            stays.Add(apiaryId, stay);
        }

        var sourceStay = stays[sourceApiaryId];
        var destinationStay = stays[destinationApiaryId];
        var stayIds = new[] { sourceStay.Id, destinationStay.Id };
        var layoutIdsByStay = await dbContext.ApiaryLayouts
            .AsNoTracking()
            .Where(layout => stayIds.Contains(layout.ApiaryStayId))
            .Select(layout => new { layout.ApiaryStayId, layout.Id })
            .ToDictionaryAsync(layout => layout.ApiaryStayId, layout => layout.Id,
                cancellationToken);

        if (!layoutIdsByStay.TryGetValue(sourceStay.Id, out var sourceLayoutId) ||
            !layoutIdsByStay.TryGetValue(destinationStay.Id, out var destinationLayoutId)) {
            throw new ConflictException(
                "relocations.current_layout_missing",
                "An active apiary stay has no layout.");
        }

        var layouts = new Dictionary<Guid, ApiaryLayout>();
        foreach (var layoutId in new[] { sourceLayoutId, destinationLayoutId }
                     .OrderBy(id => id)) {
            var layout = await dbContext.ApiaryLayouts
                .FromSqlInterpolated($"""
                    SELECT * FROM apiaries.apiary_layouts
                    WHERE id = {layoutId}
                    FOR UPDATE
                    """)
                .SingleOrDefaultAsync(cancellationToken)
                ?? throw new ConflictException(
                    "relocations.current_layout_missing",
                    "An active apiary stay has no layout.");

            layouts.Add(layoutId, layout);
        }

        _sourceLayout = layouts[sourceLayoutId];
        _destinationLayout = layouts[destinationLayoutId];
        _lockedStays = new HiveRelocationApiaryStays(
            sourceStay.Id,
            sourceStay.StartedAtUtc,
            destinationStay.Id,
            destinationStay.StartedAtUtc);

        return _lockedStays;
    }

    public async Task ApplyHiveTransferAsync(
        HiveRelocationApiaryStays stays,
        IReadOnlyCollection<Guid> hiveIds,
        CancellationToken cancellationToken) {
        if (dbContext.Database.CurrentTransaction is null ||
            _lockedStays != stays ||
            _sourceLayout is null ||
            _destinationLayout is null) {
            throw new InvalidOperationException(
                "Current layouts must be locked before transferring hives.");
        }

        await dbContext.Entry(_sourceLayout)
            .Collection(layout => layout.Positions)
            .LoadAsync(cancellationToken);

        var removedPositions = _sourceLayout.ApplyMembershipChange(hiveIds);
        dbContext.ApiaryLayoutPositions.RemoveRange(removedPositions);
        _destinationLayout.ApplyMembershipChange(Array.Empty<Guid>());

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
