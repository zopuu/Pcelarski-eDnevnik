using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.Update;

public static class UpdateQueenEndpoint {
    public static RouteGroupBuilder
        MapUpdateQueenEndpoint(
            this RouteGroupBuilder group) {
        group.MapPut(
            "/{queenId:guid}",
            async (
                Guid queenId,
                UpdateQueenRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var queen =
                        await dbContext.Queens
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id ==
                                    queenId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    if (queen is null) {
                        return Results.NotFound();
                    }
                    if (
                        request.EmergedOn is DateOnly emergedOn &&
                        request.AcquiredOn is DateOnly acquiredOn &&
                        acquiredOn < emergedOn) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.AcquiredOn)
                                ] =
                                [
                                    "Acquisition date cannot be before emergence date."
                                ]
                            });
                    }

                    queen.Update(
                        request.MarkingColorHex,
                        request.Origin,
                        request.Breeder,
                        request.Breed,
                        request.EmergedOn,
                        request.AcquiredOn,
                        request.Notes);

                    await dbContext
                        .SaveChangesAsync(
                            cancellationToken);

                    return Results.Ok(
                        new UpdateQueenResponse(
                            queen.Id,
                            queen.MarkingColorHex,
                            queen.Origin,
                            queen.Breeder,
                            queen.Breed,
                            queen.Status,
                            queen.EmergedOn,
                            queen.AcquiredOn,
                            queen.Notes,
                            queen.CreatedAtUtc,
                            queen.UpdatedAtUtc));
                });

        return group;
    }
}