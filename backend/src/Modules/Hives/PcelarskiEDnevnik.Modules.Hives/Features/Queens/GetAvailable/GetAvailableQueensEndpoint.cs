using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.GetAvailable;

public static class GetAvailableQueensEndpoint {
    public static RouteGroupBuilder
        MapGetAvailableQueensEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
            "/available",
            async (
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId = await currentBeekeeper
                        .GetBeekeeperIdAsync(cancellationToken);

                    var queens = await dbContext.Queens
                        .AsNoTracking()
                        .Where(queen => queen.OwnerBeekeeperId == beekeeperId &&
                            queen.Status == QueenStatus.Active &&
                            !dbContext.QueenStays.Any(stay =>
                                stay.QueenId == queen.Id && stay.EndedOn == null))
                        .OrderByDescending(queen => queen.EmergedOn)
                        .ThenBy(queen => queen.Id)
                        .Select(queen => new AvailableQueenResponse(
                            queen.Id,
                            queen.MarkingColorHex,
                            queen.Origin,
                            queen.Breeder,
                            queen.Breed,
                            queen.EmergedOn,
                            queen.AcquiredOn,
                            queen.Notes))
                        .ToListAsync(cancellationToken);

                    return Results.Ok(queens);
                })
            .Produces<IReadOnlyList<AvailableQueenResponse>>(
                StatusCodes.Status200OK);

        return group;
    }
}
