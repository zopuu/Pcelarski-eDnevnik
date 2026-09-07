using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.GetStayHistory;

public static class GetHiveStayHistoryEndpoint {
    private const int DefaultPageSize = 20;
    private const int MaximumPageSize = 50;

    public static IEndpointRouteBuilder
        MapGetHiveStayHistoryEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/{hiveId:guid}/stays/history",
            async (
                Guid hiveId,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                IApiaryHistoryReader apiaryHistoryReader,
                CancellationToken cancellationToken,
                int page = 1,
                int pageSize = DefaultPageSize) => {
                    if (page < 1 || pageSize < 1 ||
                        pageSize > MaximumPageSize) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                ["page"] = ["Page must be at least 1."],
                                ["pageSize"] = [
                                    $"Page size must be between 1 and {MaximumPageSize}."
                                ]
                            });
                    }

                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var ownsHive = await dbContext.Hives
                        .AsNoTracking()
                        .AnyAsync(
                            x => x.Id == hiveId &&
                                x.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (!ownsHive) {
                        return Results.NotFound();
                    }

                    var stays = await dbContext.HiveStays
                        .AsNoTracking()
                        .Where(x => x.HiveId == hiveId)
                        .OrderByDescending(x => x.StartedAtUtc)
                        .ThenByDescending(x => x.Id)
                        .Select(x => new {
                            x.Id,
                            x.ApiaryId,
                            x.StartedAtUtc,
                            x.EndedAtUtc,
                            x.Note
                        })
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize + 1)
                        .ToListAsync(cancellationToken);

                    var hasNextPage = stays.Count > pageSize;
                    var pageStays = stays.Take(pageSize).ToList();
                    var apiaries = await apiaryHistoryReader
                        .GetOwnedByIdsAsync(
                            pageStays
                                .Select(x => x.ApiaryId)
                                .Distinct()
                                .ToArray(),
                            beekeeperId,
                            cancellationToken);
                    var now = DateTimeOffset.UtcNow;
                    var items = pageStays.Select(stay => {
                        apiaries.TryGetValue(
                            stay.ApiaryId,
                            out var apiary);

                        return new HiveStayHistoryItemResponse(
                            stay.Id,
                            stay.ApiaryId,
                            apiary?.Name,
                            apiary?.ImageUrl,
                            stay.StartedAtUtc,
                            stay.EndedAtUtc,
                            stay.Note,
                            stay.EndedAtUtc is null,
                            CalculateDaysSpent(
                                stay.StartedAtUtc,
                                stay.EndedAtUtc,
                                now));
                    }).ToList();

                    return Results.Ok(
                        new HiveStayHistoryPageResponse(
                            items,
                            page,
                            hasNextPage));
                });

        return endpoints;
    }

    private static int CalculateDaysSpent(
        DateTimeOffset startedAtUtc,
        DateTimeOffset? endedAtUtc,
        DateTimeOffset now) {
        var end = endedAtUtc ?? now;
        var calendarDays =
            (end.Date - startedAtUtc.Date).Days + 1;

        return Math.Max(1, calendarDays);
    }
}

public sealed record HiveStayHistoryItemResponse(
    Guid Id,
    Guid ApiaryId,
    string? ApiaryName,
    string? ApiaryImageUrl,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc,
    string? Note,
    bool IsActive,
    int DaysSpent);

public sealed record HiveStayHistoryPageResponse(
    IReadOnlyList<HiveStayHistoryItemResponse> Items,
    int Page,
    bool HasNextPage);
