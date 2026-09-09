using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;

public static class GetHiveActionHistoryEndpoint {
    private const int DefaultPageSize = 20;
    private const int MaximumPageSize = 50;

    public static RouteGroupBuilder
        MapGetHiveActionHistoryEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/actions",
                HandleAsync)
            .WithName(
                "GetHiveActionHistory")
            .Produces<HiveActionHistoryPageResponse>()
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        Guid hiveId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken,
        int page = 1,
        int pageSize = DefaultPageSize) {
        if (page < 1 ||
            pageSize < 1 ||
            pageSize > MaximumPageSize ||
            page > (int.MaxValue - 1) / pageSize) {
            return Results.ValidationProblem(
                new Dictionary<string, string[]> {
                    ["page"] =
                    [
                        "Page must be at least 1."
                    ],
                    ["pageSize"] =
                    [
                        $"Page size must be between 1 and {MaximumPageSize}."
                    ]
                });
        }

        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var ownsHive =
            await dbContext.Hives
                .AsNoTracking()
                .AnyAsync(
                    hive =>
                        hive.Id == hiveId &&
                        hive.OwnerBeekeeperId == beekeeperId,
                    cancellationToken);

        if (!ownsHive) {
            return Results.NotFound();
        }

        var offset = checked((page - 1) * pageSize);
        var itemsRequiredFromEachSource = checked(offset + pageSize + 1);

        // The enum properties are stored as varchar values. Projecting them
        // through a SQL UNION loses their EF value converters, so each source
        // is materialized independently before the small, bounded merge.
        var inspections =
            await dbContext.HiveInspections
                .AsNoTracking()
                .Where(
                    inspection =>
                        inspection.HiveId == hiveId)
                .OrderByDescending(
                    inspection =>
                        inspection.PerformedAt)
                .ThenByDescending(
                    inspection =>
                        inspection.Id)
                .Select(
                    inspection =>
                        new HiveActionHistoryItemResponse(
                            inspection.Id,
                            inspection.PerformedAt,
                            HiveActionHistoryKind.Inspection,
                            inspection.InspectionType,
                            inspection.OverallConditionRating,
                            inspection.Disease != null ||
                                inspection.Pest != null ||
                                inspection.Predator != null ||
                                inspection.MoldPresent == true ||
                                inspection.ExcessMoisturePresent == true,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null))
                .Take(
                    itemsRequiredFromEachSource)
                .ToListAsync(
                    cancellationToken);

        var treatments =
            await dbContext.VarroaTreatments
                .AsNoTracking()
                .Where(
                    treatment =>
                        treatment.HiveId == hiveId)
                .OrderByDescending(
                    treatment =>
                        treatment.PerformedAt)
                .ThenByDescending(
                    treatment =>
                        treatment.Id)
                .Select(
                    treatment =>
                        new HiveActionHistoryItemResponse(
                            treatment.Id,
                            treatment.PerformedAt,
                            HiveActionHistoryKind.VarroaTreatment,
                            null,
                            null,
                            null,
                            treatment.ProductName,
                            treatment.ApplicationMethod,
                            treatment.DoseAmount,
                            treatment.DoseUnit,
                            null,
                            null,
                            null))
                .Take(
                    itemsRequiredFromEachSource)
                .ToListAsync(
                    cancellationToken);

        var syrupFeedings =
            await dbContext.SyrupFeedings
                .AsNoTracking()
                .Where(
                    feeding =>
                        feeding.HiveId == hiveId)
                .OrderByDescending(
                    feeding =>
                        feeding.PerformedAt)
                .ThenByDescending(
                    feeding =>
                        feeding.Id)
                .Select(
                    feeding =>
                        new HiveActionHistoryItemResponse(
                            feeding.Id,
                            feeding.PerformedAt,
                            HiveActionHistoryKind.SyrupFeeding,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            feeding.QuantityMl,
                            feeding.SugarParts,
                            feeding.WaterParts))
                .Take(
                    itemsRequiredFromEachSource)
                .ToListAsync(
                    cancellationToken);

        var actions =
            inspections
                .Concat(
                    treatments)
                .Concat(
                    syrupFeedings)
                .OrderByDescending(
                    action =>
                        action.PerformedAt)
                .ThenByDescending(
                    action =>
                        action.Id)
                .Skip(
                    offset)
                .Take(
                    pageSize + 1)
                .ToList();

        var hasNextPage =
            actions.Count > pageSize;

        return Results.Ok(
            new HiveActionHistoryPageResponse(
                actions.Take(
                        pageSize)
                    .ToList(),
                page,
                hasNextPage));
    }
}

public enum HiveActionHistoryKind {
    Inspection,
    VarroaTreatment,
    SyrupFeeding
}

public sealed record HiveActionHistoryItemResponse(
    Guid Id,
    DateTimeOffset PerformedAt,
    HiveActionHistoryKind Kind,
    HiveInspectionType? InspectionType,
    short? OverallConditionRating,
    bool? HasHealthIssue,
    string? ProductName,
    VarroaApplicationMethod? ApplicationMethod,
    decimal? DoseAmount,
    VarroaDoseUnit? DoseUnit,
    int? QuantityMl,
    decimal? SugarParts,
    decimal? WaterParts);

public sealed record HiveActionHistoryPageResponse(
    IReadOnlyList<HiveActionHistoryItemResponse> Items,
    int Page,
    bool HasNextPage);
