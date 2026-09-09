using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInspection;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections.GetHistory;

public static class GetHiveInspectionHistoryEndpoint {
    private const int DefaultPageSize = 20;
    private const int MaximumPageSize = 50;

    public static RouteGroupBuilder MapGetHiveInspectionHistoryEndpoint(
        this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/inspections",
                HandleAsync)
            .WithName("GetHiveInspectionHistory")
            .Produces<HiveInspectionHistoryPageResponse>()
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    private static async Task<IResult> HandleAsync(
        Guid hiveId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken,
        int page = 1,
        int pageSize = DefaultPageSize) {
        if (page < 1 || pageSize < 1 || pageSize > MaximumPageSize) {
            return Results.ValidationProblem(
                new Dictionary<string, string[]> {
                    ["page"] = ["Page must be at least 1."],
                    ["pageSize"] = [
                        $"Page size must be between 1 and {MaximumPageSize}."
                    ]
                });
        }

        var beekeeperId = await currentBeekeeper.GetBeekeeperIdAsync(
            cancellationToken);
        var ownsHive = await dbContext.Hives
            .AsNoTracking()
            .AnyAsync(
                hive => hive.Id == hiveId &&
                    hive.OwnerBeekeeperId == beekeeperId,
                cancellationToken);

        if (!ownsHive) {
            return Results.NotFound();
        }

        var inspections = await dbContext.HiveInspections
            .AsNoTracking()
            .Where(inspection => inspection.HiveId == hiveId)
            .OrderByDescending(inspection => inspection.PerformedAt)
            .ThenByDescending(inspection => inspection.Id)
            .Select(inspection => new HiveInspectionHistoryItemResponse(
                inspection.Id,
                inspection.PerformedAt,
                inspection.InspectionType,
                inspection.OverallConditionRating,
                inspection.Disease != null ||
                    inspection.Pest != null ||
                    inspection.Predator != null ||
                    inspection.MoldPresent == true ||
                    inspection.ExcessMoisturePresent == true))
            .Skip((page - 1) * pageSize)
            .Take(pageSize + 1)
            .ToListAsync(cancellationToken);

        var hasNextPage = inspections.Count > pageSize;

        return Results.Ok(
            new HiveInspectionHistoryPageResponse(
                inspections.Take(pageSize).ToList(),
                page,
                hasNextPage));
    }
}

public sealed record HiveInspectionHistoryItemResponse(
    Guid Id,
    DateTimeOffset PerformedAt,
    HiveInspectionType? InspectionType,
    short? OverallConditionRating,
    bool HasHealthIssue);

public sealed record HiveInspectionHistoryPageResponse(
    IReadOnlyList<HiveInspectionHistoryItemResponse> Items,
    int Page,
    bool HasNextPage);
