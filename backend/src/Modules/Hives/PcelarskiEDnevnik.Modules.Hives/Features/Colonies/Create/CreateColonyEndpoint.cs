using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Create;

public static class CreateColonyEndpoint {
    public static RouteGroupBuilder
        MapCreateColonyEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
            "/{hiveId:guid}/colonies",
            async (
                Guid hiveId,
                CreateColonyRequest request,
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
                                x =>
                                    new {
                                        x.Id
                                    })
                            .SingleOrDefaultAsync(
                                cancellationToken);

                    if (hive is null) {
                        return Results.NotFound();
                    }

                    var hasActiveColony =
                        await dbContext.ColonyStays
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.HiveId == hiveId &&
                                    x.EndedOn == null,
                                cancellationToken);

                    if (hasActiveColony) {
                        throw new ConflictException(
                            "colonies.hive_already_has_active_colony",
                            "The hive already has an active colony.");
                    }

                    if (
                        request.FormedOn is not null &&
                        request.StartedOn <
                        request.FormedOn) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.StartedOn)
                                ] =
                                [
                                    "Stay start date cannot be before colony formation date."
                                ]
                            });
                    }

                    var colony =
                        Colony.Create(
                            beekeeperId,
                            request.Origin,
                            request.FormedOn,
                            request.Notes);

                    var colonyStay =
                        ColonyStay.Start(
                            colony.Id,
                            hiveId,
                            request.StartedOn!.Value,
                            request.StayNotes);

                    dbContext.Colonies.Add(
                        colony);

                    dbContext.ColonyStays.Add(
                        colonyStay);

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
                        new CreateColonyResponse(
                            colony.Id,
                            colonyStay.Id));
                });

        return group;
    }
}