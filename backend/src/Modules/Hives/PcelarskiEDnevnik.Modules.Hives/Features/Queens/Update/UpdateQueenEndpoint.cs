using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

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

                    await using var transaction =
                        await dbContext.Database.BeginTransactionAsync(
                            cancellationToken);

                    queen.Update(
                        request.MarkingColorHex,
                        request.Origin,
                        request.Breeder,
                        request.Breed,
                        request.EmergedOn,
                        request.AcquiredOn,
                        request.Notes);

                    if (request.IntroductionOutcome is not null) {
                        var activeStay =
                            await dbContext.QueenStays
                                .SingleOrDefaultAsync(
                                    stay =>
                                        stay.QueenId == queen.Id &&
                                        stay.EndedOn == null,
                                    cancellationToken);

                        if (activeStay is null) {
                            throw new ConflictException(
                                "queens.no_active_stay",
                                "The queen does not have an active stay.");
                        }

                        if (!CanUpdateIntroductionOutcome(
                                activeStay.IntroductionOutcome)) {
                            throw new ConflictException(
                                "queens.introduction_outcome_finalized",
                                "The introduction outcome has already been finalized.");
                        }

                        activeStay.UpdateIntroductionOutcome(
                            request.IntroductionOutcome.Value);

                        if (request.IntroductionOutcome ==
                            QueenIntroductionOutcome.Killed) {
                            var today =
                                DateOnly.FromDateTime(
                                    DateTime.UtcNow);

                            if (today < activeStay.StartedOn) {
                                return Results.ValidationProblem(
                                    new Dictionary<string, string[]> {
                                        [nameof(request.IntroductionOutcome)] = [
                                            "A queen stay cannot end before it starts."
                                        ]
                                    });
                            }

                            if (queen.Status != QueenStatus.Active) {
                                throw new ConflictException(
                                    "queens.not_active",
                                    "Only an active queen can be marked as killed.");
                            }

                            activeStay.End(
                                today,
                                QueenStayEndReason.Killed);
                            queen.MarkKilled();
                        }
                    }

                    await dbContext
                        .SaveChangesAsync(
                            cancellationToken);

                    await transaction.CommitAsync(
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

    private static bool CanUpdateIntroductionOutcome(
        QueenIntroductionOutcome? outcome) {
        return outcome is null or
            QueenIntroductionOutcome.Missing or
            QueenIntroductionOutcome.Unverified or
            QueenIntroductionOutcome.Other;
    }
}
