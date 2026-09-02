using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.Create;

public static class CreateQueenEndpoint {
    public static RouteGroupBuilder
        MapCreateQueenEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
            "/{colonyId:guid}/queens",
            async (
                Guid colonyId,
                CreateQueenRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var colony =
                        await dbContext.Colonies
                            .AsNoTracking()
                            .Where(
                                x =>
                                    x.Id == colonyId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId)
                            .Select(
                                x => new {
                                    x.Id,
                                    x.Status
                                })
                            .SingleOrDefaultAsync(
                                cancellationToken);

                    if (colony is null) {
                        return Results.NotFound();
                    }

                    if (colony.Status !=
                        ColonyStatus.Active) {
                        throw new ConflictException(
                            "queens.colony_not_active",
                            "A queen cannot be assigned to an inactive colony.");
                    }

                    var hasActiveQueen =
                        await dbContext.QueenStays
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.ColonyId ==
                                    colonyId &&
                                    x.EndedOn ==
                                    null,
                                cancellationToken);

                    if (hasActiveQueen) {
                        throw new ConflictException(
                            "queens.colony_already_has_active_queen",
                            "The colony already has an active queen.");
                    }

                    if (
                        request.EmergedOn is DateOnly emergedOn &&
                        request.StartedOn is DateOnly startedOn &&
                        startedOn < emergedOn) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.StartedOn)
                                ] =
                                [
                                    "Queen stay cannot start before the queen emerged."
                                ]
                            });
                    }


                    var queen =
                        Queen.Create(
                            beekeeperId,
                            request.MarkingColorHex,
                            request.Origin,
                            request.Breeder,
                            request.Breed,
                            request.EmergedOn,
                            request.AcquiredOn,
                            request.Notes);

                    var stay =
                        QueenStay.Start(
                            queen.Id,
                            colonyId,
                            request.StartedOn!.Value,
                            request.IntroductionMethod,
                            request.IntroductionOutcome,
                            request.StayNotes);

                    dbContext.Queens.Add(
                        queen);

                    dbContext.QueenStays.Add(
                        stay);

                    try {
                        await dbContext
                            .SaveChangesAsync(
                                cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (
                            QueenPersistenceErrors
                                .IsActiveColonyConflict(
                                    exception)) {
                        throw new ConflictException(
                            "queens.colony_already_has_active_queen",
                            "The colony already has an active queen.",
                            exception);
                    }

                    return Results.Created(
                        $"/api/queens/{queen.Id}",
                        new CreateQueenResponse(
                            queen.Id,
                            stay.Id));
                });

        return group;
    }
}