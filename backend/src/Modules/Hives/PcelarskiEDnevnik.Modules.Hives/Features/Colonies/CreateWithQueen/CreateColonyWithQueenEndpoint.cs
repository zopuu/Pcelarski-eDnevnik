using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.CreateWithQueen;

public static class CreateColonyWithQueenEndpoint {
    public static RouteGroupBuilder
        MapCreateColonyWithQueenEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
            "/{hiveId:guid}/colony-with-queen",
            async (
                Guid hiveId,
                CreateColonyWithQueenRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var hive =
                        await dbContext.Hives
                            .AsNoTracking()
                            .Where(
                                x =>
                                    x.Id == hiveId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId)
                            .Select(
                                x => new {
                                    x.Id,
                                    x.Status
                                })
                            .SingleOrDefaultAsync(
                                cancellationToken);

                    if (hive is null) {
                        return Results.NotFound();
                    }

                    if (hive.Status !=
                        HiveStatus.Active) {
                        throw new ConflictException(
                            "colonies.hive_not_active",
                            "A colony cannot be added to an inactive hive.");
                    }

                    var hasCurrentColony =
                        await dbContext.ColonyStays
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.HiveId ==
                                    hiveId &&
                                    x.EndedOn ==
                                    null,
                                cancellationToken);

                    if (hasCurrentColony) {
                        throw new ConflictException(
                            "colonies.hive_already_has_active_colony",
                            "The hive already has an active colony.");
                    }

                    var colonyStartedOn =
                        request.ColonyStartedOn!.Value;

                    var queenStartedOn =
                        request.QueenStartedOn!.Value;

                    if (
                        request.ColonyFormedOn
                            is DateOnly formedOn &&
                        colonyStartedOn < formedOn) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.ColonyStartedOn)
                                ] =
                                [
                                    "Colony stay cannot start before the colony was formed."
                                ]
                            });
                    }

                    if (
                        request.QueenEmergedOn
                            is DateOnly emergedOn &&
                        queenStartedOn < emergedOn) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.QueenStartedOn)
                                ] =
                                [
                                    "Queen stay cannot start before the queen emerged."
                                ]
                            });
                    }

                    if (
                        request.QueenEmergedOn
                            is DateOnly queenEmergedOn &&
                        request.QueenAcquiredOn
                            is DateOnly acquiredOn &&
                        acquiredOn < queenEmergedOn) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.QueenAcquiredOn)
                                ] =
                                [
                                    "Queen acquisition date cannot be before emergence date."
                                ]
                            });
                    }

                    if (
                        queenStartedOn <
                        colonyStartedOn) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.QueenStartedOn)
                                ] =
                                [
                                    "Queen stay cannot start before the colony stay."
                                ]
                            });
                    }

                    var colony =
                        Colony.Create(
                            beekeeperId,
                            request.ColonyOrigin,
                            request.ColonyFormedOn,
                            request.ColonyNotes);

                    var colonyStay =
                        ColonyStay.Start(
                            colony.Id,
                            hiveId,
                            colonyStartedOn,
                            request.ColonyStayNotes);

                    var queen =
                        Queen.Create(
                            beekeeperId,
                            request
                                .QueenMarkingColorHex,
                            request.QueenOrigin,
                            request.QueenBreeder,
                            request.QueenBreed,
                            request.QueenEmergedOn,
                            request.QueenAcquiredOn,
                            request.QueenNotes);

                    var queenStay =
                        QueenStay.Start(
                            queen.Id,
                            colony.Id,
                            queenStartedOn,
                            request
                                .QueenIntroductionMethod,
                            request
                                .QueenIntroductionOutcome,
                            request.QueenStayNotes);

                    dbContext.Colonies.Add(
                        colony);

                    dbContext.ColonyStays.Add(
                        colonyStay);

                    dbContext.Queens.Add(
                        queen);

                    dbContext.QueenStays.Add(
                        queenStay);

                    try {
                        await dbContext
                            .SaveChangesAsync(
                                cancellationToken);
                    }
                    catch (
                        DbUpdateException exception)
                        when (
                            ColonyPersistenceErrors
                                .IsActiveHiveConflict(
                                    exception)) {
                        throw new ConflictException(
                            "colonies.hive_already_has_active_colony",
                            "The hive already has an active colony.",
                            exception);
                    }

                    return Results.Created(
                        $"/api/colonies/{colony.Id}",
                        new CreateColonyWithQueenResponse(
                            colony.Id,
                            colonyStay.Id,
                            queen.Id,
                            queenStay.Id));
                });

        return group;
    }
}