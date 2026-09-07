using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetHistory;

public static class GetApiaryStayHistoryEndpoint {
    private const int DefaultPageSize = 20;
    private const int MaximumPageSize = 50;

    public static IEndpointRouteBuilder
        MapGetApiaryStayHistoryEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/history",
            async (
                Guid apiaryId,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
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

                    var ownsApiary =
                        await dbContext.Apiaries
                            .AsNoTracking()
                            .AnyAsync(
                                x => x.Id == apiaryId &&
                                    x.OwnerBeekeeperId == beekeeperId &&
                                    x.Status == ApiaryStatus.Active,
                                cancellationToken);

                    if (!ownsApiary) {
                        return Results.NotFound();
                    }

                    var stays =
                        await (
                            from stay in dbContext.ApiaryStays
                                .AsNoTracking()
                            join location in dbContext.Locations
                                .AsNoTracking()
                                on stay.LocationId equals location.Id
                            where stay.ApiaryId == apiaryId
                            orderby stay.StartedAtUtc descending,
                                stay.Id descending
                            select new {
                                stay.Id,
                                LocationName = location.Name,
                                location.AltitudeMeters,
                                stay.StartedAtUtc,
                                stay.EndedAtUtc,
                                stay.Orientation
                            }
                        )
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize + 1)
                        .ToListAsync(cancellationToken);

                    var hasNextPage = stays.Count > pageSize;
                    var now = DateTimeOffset.UtcNow;
                    var items = stays
                        .Take(pageSize)
                        .Select(stay =>
                            new ApiaryStayHistoryItemResponse(
                                stay.Id,
                                stay.LocationName,
                                stay.AltitudeMeters,
                                stay.StartedAtUtc,
                                stay.EndedAtUtc,
                                stay.Orientation,
                                stay.EndedAtUtc is null,
                                CalculateDaysSpent(
                                    stay.StartedAtUtc,
                                    stay.EndedAtUtc,
                                    now)))
                        .ToList();

                    return Results.Ok(
                        new ApiaryStayHistoryPageResponse(
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

public sealed record ApiaryStayHistoryItemResponse(
    Guid Id,
    string? LocationName,
    int? AltitudeMeters,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc,
    HiveEntranceOrientation? Orientation,
    bool IsActive,
    int DaysSpent);

public sealed record ApiaryStayHistoryPageResponse(
    IReadOnlyList<ApiaryStayHistoryItemResponse> Items,
    int Page,
    bool HasNextPage);
