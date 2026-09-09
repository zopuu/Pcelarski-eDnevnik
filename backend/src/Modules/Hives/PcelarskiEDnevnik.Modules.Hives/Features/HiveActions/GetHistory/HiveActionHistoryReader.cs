using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.ReadModels;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;

internal sealed class HiveActionHistoryReader(
    HivesDbContext dbContext) {
    public async Task<HiveActionHistoryPageResponse> ReadAsync(
        Guid hiveId,
        int limit,
        HiveActionHistoryCursor? cursor,
        CancellationToken cancellationToken) {
        var query =
            CreateBaseTimelineQuery(
                hiveId,
                cursor);

        var baseRows =
            await query
                .OrderByDescending(
                    action =>
                        action.PerformedAt)
                .ThenByDescending(
                    action =>
                        action.Id)
                .Take(
                    limit + 1)
                .ToListAsync(
                    cancellationToken);

        var hasNextPage =
            baseRows.Count > limit;
        var pageRows =
            baseRows.Take(
                    limit)
                .ToList();
        var summaries =
            await LoadSummariesAsync(
                pageRows,
                cancellationToken);
        var items =
            pageRows.Select(
                    action =>
                        new HiveActionHistoryItemResponse(
                            action.Id,
                            action.PerformedAt,
                            action.ActionType,
                            summaries[action.Id]))
                .ToList();

        return new HiveActionHistoryPageResponse(
            items,
            hasNextPage
                ? HiveActionHistoryCursorCodec.Encode(
                    new HiveActionHistoryCursor(
                        pageRows[^1].PerformedAt,
                        pageRows[^1].Id))
                : null);
    }

    internal IQueryable<HiveActionTimelineRow> CreateBaseTimelineQuery(
        Guid hiveId,
        HiveActionHistoryCursor? cursor) {
        IQueryable<HiveActionTimelineRow> query =
            dbContext.Database.ProviderName ==
                "Microsoft.EntityFrameworkCore.InMemory"
                ? dbContext.HiveActions
                    .AsNoTracking()
                    .Where(
                        action =>
                            action.HiveId == hiveId)
                    .Select(
                        action =>
                            new HiveActionTimelineRow {
                                Id = action.Id,
                                HiveId = action.HiveId,
                                PerformedAt = action.PerformedAt,
                                ActionType = action.ActionType
                            })
                : dbContext.HiveActionTimelineRows
                    .AsNoTracking()
                .Where(
                    action =>
                        action.HiveId == hiveId);

        if (cursor is { } value) {
            query =
                query.Where(
                    action =>
                        action.PerformedAt < value.PerformedAt ||
                        action.PerformedAt == value.PerformedAt &&
                        action.Id.CompareTo(
                            value.Id) < 0);
        }

        return query;
    }

    private async Task<Dictionary<Guid, HiveActionHistorySummary>>
        LoadSummariesAsync(
            IReadOnlyList<HiveActionTimelineRow> pageRows,
            CancellationToken cancellationToken) {
        var idsByType =
            pageRows.GroupBy(
                    action =>
                        action.ActionType)
                .ToDictionary(
                    group =>
                        group.Key,
                    group =>
                        group.Select(
                                action =>
                                    action.Id)
                            .ToArray());
        var summaries =
            new Dictionary<Guid, HiveActionHistorySummary>(
                pageRows.Count);

        if (idsByType.TryGetValue(
                HiveActionType.Inspection,
                out var inspectionIds)) {
            var rows =
                await dbContext.HiveInspections
                    .AsNoTracking()
                    .Where(
                        inspection =>
                            inspectionIds.Contains(
                                inspection.Id))
                    .Select(
                        inspection =>
                            new {
                                inspection.Id,
                                inspection.InspectionType,
                                inspection.OverallConditionRating,
                                HasHealthIssue =
                                    inspection.Disease != null ||
                                    inspection.Pest != null ||
                                    inspection.Predator != null ||
                                    inspection.MoldPresent == true ||
                                    inspection.ExcessMoisturePresent == true
                            })
                    .ToListAsync(
                        cancellationToken);

            foreach (var row in rows) {
                summaries[row.Id] =
                    new InspectionHistorySummary(
                        row.InspectionType,
                        row.OverallConditionRating,
                        row.HasHealthIssue);
            }
        }

        if (idsByType.TryGetValue(
                HiveActionType.VarroaTreatment,
                out var treatmentIds)) {
            var rows =
                await dbContext.VarroaTreatments
                    .AsNoTracking()
                    .Where(
                        treatment =>
                            treatmentIds.Contains(
                                treatment.Id))
                    .Select(
                        treatment =>
                            new {
                                treatment.Id,
                                treatment.ProductName,
                                treatment.ApplicationMethod,
                                treatment.DoseAmount,
                                treatment.DoseUnit
                            })
                    .ToListAsync(
                        cancellationToken);

            foreach (var row in rows) {
                summaries[row.Id] =
                    new VarroaTreatmentHistorySummary(
                        row.ProductName,
                        row.ApplicationMethod,
                        row.DoseAmount,
                        row.DoseUnit);
            }
        }

        if (idsByType.TryGetValue(
                HiveActionType.SyrupFeeding,
                out var syrupFeedingIds)) {
            var rows =
                await dbContext.SyrupFeedings
                    .AsNoTracking()
                    .Where(
                        feeding =>
                            syrupFeedingIds.Contains(
                                feeding.Id))
                    .Select(
                        feeding =>
                            new {
                                feeding.Id,
                                feeding.QuantityMl,
                                feeding.SugarParts,
                                feeding.WaterParts
                            })
                    .ToListAsync(
                        cancellationToken);

            foreach (var row in rows) {
                summaries[row.Id] =
                    new SyrupFeedingHistorySummary(
                        row.QuantityMl,
                        row.SugarParts,
                        row.WaterParts);
            }
        }

        if (idsByType.TryGetValue(
                HiveActionType.PattyFeeding,
                out var pattyFeedingIds)) {
            var rows =
                await dbContext.PattyFeedings
                    .AsNoTracking()
                    .Where(
                        feeding =>
                            pattyFeedingIds.Contains(
                                feeding.Id))
                    .Select(
                        feeding =>
                            new {
                                feeding.Id,
                                feeding.MassG,
                                feeding.PattyType,
                                feeding.Manufacturer
                            })
                    .ToListAsync(
                        cancellationToken);

            foreach (var row in rows) {
                summaries[row.Id] =
                    new PattyFeedingHistorySummary(
                        row.MassG,
                        row.PattyType,
                        row.Manufacturer);
            }
        }

        if (idsByType.TryGetValue(
                HiveActionType.HoneyFrameFeeding,
                out var honeyFrameFeedingIds)) {
            var rows =
                await dbContext.HoneyFrameFeedings
                    .AsNoTracking()
                    .Where(
                        feeding =>
                            honeyFrameFeedingIds.Contains(
                                feeding.Id))
                    .Select(
                        feeding =>
                            new {
                                feeding.Id,
                                feeding.FrameCount,
                                feeding.FrameSource
                            })
                    .ToListAsync(
                        cancellationToken);

            foreach (var row in rows) {
                summaries[row.Id] =
                    new HoneyFrameFeedingHistorySummary(
                        row.FrameCount,
                        row.FrameSource);
            }
        }

        if (idsByType.TryGetValue(
                HiveActionType.Insulation,
                out var insulationIds)) {
            var rows =
                await dbContext.HiveInsulations
                    .AsNoTracking()
                    .Where(
                        insulation =>
                            insulationIds.Contains(
                                insulation.Id))
                    .Select(
                        insulation =>
                            new {
                                insulation.Id,
                                insulation.Operation,
                                insulation.Paper,
                                insulation.Eps,
                                insulation.Xps
                            })
                    .ToListAsync(
                        cancellationToken);

            foreach (var row in rows) {
                summaries[row.Id] =
                    new InsulationHistorySummary(
                        row.Operation,
                        row.Paper,
                        row.Eps,
                        row.Xps);
            }
        }

        if (idsByType.TryGetValue(
                HiveActionType.Maintenance,
                out var maintenanceIds)) {
            var rows =
                await dbContext.HiveMaintenances
                    .AsNoTracking()
                    .Where(
                        maintenance =>
                            maintenanceIds.Contains(
                                maintenance.Id))
                    .Select(
                        maintenance =>
                            new {
                                maintenance.Id,
                                maintenance.MaintenanceType,
                                maintenance.CostAmount,
                                maintenance.CurrencyCode,
                                maintenance.ServiceProvider
                            })
                    .ToListAsync(
                        cancellationToken);

            foreach (var row in rows) {
                summaries[row.Id] =
                    new MaintenanceHistorySummary(
                        row.MaintenanceType,
                        row.CostAmount,
                        row.CurrencyCode,
                        row.ServiceProvider);
            }
        }

        if (idsByType.TryGetValue(
                HiveActionType.SuperManagement,
                out var superManagementIds)) {
            var ids =
                await dbContext.SuperManagements
                    .AsNoTracking()
                    .Where(
                        action =>
                            superManagementIds.Contains(
                                action.Id))
                    .Select(
                        action =>
                            action.Id)
                    .ToListAsync(
                        cancellationToken);

            foreach (var id in ids) {
                summaries[id] =
                    new SuperManagementHistorySummary();
            }
        }

        return summaries;
    }
}
