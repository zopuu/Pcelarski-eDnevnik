using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetStays;

public static class GetQueenStaysEndpoint {
    private const int DefaultPageSize = 20;
    private const int MaximumPageSize = 50;

    public static RouteGroupBuilder
        MapGetQueenStaysEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
            "/{queenId:guid}/stays",
            async (
                Guid queenId,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
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

                    var queenExists =
                        await dbContext.Queens
                            .AsNoTracking()
                            .AnyAsync(
                                queen =>
                                    queen.Id == queenId &&
                                    queen.OwnerBeekeeperId == beekeeperId,
                                cancellationToken);

                    if (!queenExists) {
                        return Results.NotFound();
                    }

                    var stays =
                        await (
                            from stay in dbContext.QueenStays.AsNoTracking()
                            join colony in dbContext.Colonies.AsNoTracking()
                                on stay.ColonyId equals colony.Id
                            where stay.QueenId == queenId &&
                                colony.OwnerBeekeeperId == beekeeperId
                            select new {
                                stay.Id,
                                stay.ColonyId,
                                stay.StartedOn,
                                stay.EndedOn,
                                colony.Origin,
                                colony.FormedOn,
                                stay.IntroductionMethod,
                                stay.IntroductionOutcome,
                                stay.Notes
                            })
                            .OrderByDescending(stay => stay.StartedOn)
                            .ThenByDescending(stay => stay.Id)
                            .Skip((page - 1) * pageSize)
                            .Take(pageSize + 1)
                            .ToListAsync(cancellationToken);

                    var hasNextPage = stays.Count > pageSize;
                    var pageStays = stays.Take(pageSize).ToList();
                    var colonyIds = pageStays
                        .Select(stay => stay.ColonyId)
                        .Distinct()
                        .ToArray();

                    var colonyHiveStays =
                        await (
                            from colonyStay in dbContext.ColonyStays.AsNoTracking()
                            join hive in dbContext.Hives.AsNoTracking()
                                on colonyStay.HiveId equals hive.Id
                            where colonyIds.Contains(colonyStay.ColonyId) &&
                                hive.OwnerBeekeeperId == beekeeperId
                            select new {
                                colonyStay.ColonyId,
                                colonyStay.StartedOn,
                                colonyStay.EndedOn,
                                Hive = new QueenStayHiveResponse(
                                    hive.Id,
                                    hive.Label,
                                    hive.ColorHex)
                            })
                        .ToListAsync(cancellationToken);

                    var items = pageStays.Select(stay => {
                        var stayEnd = stay.EndedOn ?? DateOnly.MaxValue;
                        var hives = colonyHiveStays
                            .Where(colonyStay =>
                                colonyStay.ColonyId == stay.ColonyId &&
                                colonyStay.StartedOn <= stayEnd &&
                                (colonyStay.EndedOn is null ||
                                 colonyStay.EndedOn >= stay.StartedOn))
                            .OrderBy(colonyStay => colonyStay.StartedOn)
                            .Select(colonyStay => colonyStay.Hive)
                            .ToList();

                        return new QueenStayHistoryItemResponse(
                            stay.Id,
                            stay.StartedOn,
                            stay.EndedOn,
                            stay.Origin,
                            stay.FormedOn,
                            stay.IntroductionMethod,
                            stay.IntroductionOutcome,
                            stay.Notes,
                            hives);
                    }).ToList();

                    return Results.Ok(
                        new GetQueenStaysPageResponse(
                            items,
                            page,
                            hasNextPage));
                })
            .Produces<GetQueenStaysPageResponse>(
                StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }
}
