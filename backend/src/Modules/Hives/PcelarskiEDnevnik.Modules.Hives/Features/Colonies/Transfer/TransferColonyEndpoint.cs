using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Transfer;

public static class TransferColonyEndpoint {
    public static RouteGroupBuilder
        MapTransferColonyEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
                "/{colonyId:guid}/transfer",
                async (
                    Guid colonyId,
                    TransferColonyRequest request,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var destinationHiveId =
                        request.DestinationHiveId.GetValueOrDefault();
                    var transferredOn =
                        request.TransferredOn.GetValueOrDefault();
                    var requestErrors =
                        new Dictionary<string, string[]>();

                    if (destinationHiveId == Guid.Empty) {
                        requestErrors[nameof(request.DestinationHiveId)] = [
                            "Destination hive is required."
                        ];
                    }

                    if (request.TransferredOn is null) {
                        requestErrors[nameof(request.TransferredOn)] = [
                            "Transfer date is required."
                        ];
                    }

                    if (requestErrors.Count > 0) {
                        return Results.ValidationProblem(requestErrors);
                    }

                    var colony =
                        await dbContext.Colonies.SingleOrDefaultAsync(
                            item =>
                                item.Id == colonyId &&
                                item.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (colony is null) {
                        return Results.NotFound();
                    }

                    var activeStays =
                        await dbContext.ColonyStays
                            .Where(
                                stay =>
                                    stay.ColonyId == colonyId &&
                                    stay.EndedOn == null)
                            .ToListAsync(cancellationToken);

                    if (activeStays.Count != 1) {
                        throw new ConflictException(
                            "colonies.invalid_active_stay_state",
                            "The colony must have exactly one active stay to be transferred.");
                    }

                    var currentStay = activeStays[0];
                    var sourceHiveIsOwned =
                        await dbContext.Hives.AsNoTracking().AnyAsync(
                            hive =>
                                hive.Id == currentStay.HiveId &&
                                hive.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (!sourceHiveIsOwned) {
                        return Results.NotFound();
                    }

                    var destinationHiveIsOwned =
                        await dbContext.Hives.AsNoTracking().AnyAsync(
                            hive =>
                                hive.Id == destinationHiveId &&
                                hive.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (!destinationHiveIsOwned) {
                        return Results.NotFound();
                    }

                    var validationErrors = Validate(
                        destinationHiveId,
                        currentStay,
                        colony.FormedOn,
                        transferredOn);

                    if (validationErrors.Count > 0) {
                        return Results.ValidationProblem(validationErrors);
                    }

                    var destinationIsOccupied =
                        await dbContext.ColonyStays.AsNoTracking().AnyAsync(
                            stay =>
                                stay.HiveId == destinationHiveId &&
                                stay.EndedOn == null,
                            cancellationToken);

                    if (destinationIsOccupied) {
                        throw new ConflictException(
                            "colonies.destination_hive_occupied",
                            "The destination hive already has an active colony.");
                    }

                    await using var transaction =
                        await dbContext.Database.BeginTransactionAsync(
                            cancellationToken);

                    currentStay.End(transferredOn);

                    var newStay = ColonyStay.Start(
                        colony.Id,
                        destinationHiveId,
                        transferredOn,
                        notes: null);

                    dbContext.ColonyStays.Add(newStay);

                    try {
                        await dbContext.SaveChangesAsync(cancellationToken);
                        await transaction.CommitAsync(cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (ColonyPersistenceErrors.IsActiveHiveConflict(exception)) {
                        throw new ConflictException(
                            "colonies.destination_hive_occupied",
                            "The destination hive already has an active colony.",
                            exception);
                    }
                    catch (DbUpdateException exception)
                        when (ColonyPersistenceErrors.IsActiveColonyConflict(exception)) {
                        throw new ConflictException(
                            "colonies.invalid_active_stay_state",
                            "The colony no longer has a valid active stay to transfer.",
                            exception);
                    }

                    return Results.Ok(
                        new TransferColonyResponse(
                            colony.Id,
                            currentStay.HiveId,
                            destinationHiveId,
                            currentStay.Id,
                            newStay.Id,
                            transferredOn));
                })
            .WithName("TransferColony")
            .Produces<TransferColonyResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return group;
    }

    private static Dictionary<string, string[]> Validate(
        Guid destinationHiveId,
        ColonyStay currentStay,
        DateOnly? colonyFormedOn,
        DateOnly transferredOn) {
        var errors = new Dictionary<string, string[]>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (destinationHiveId == currentStay.HiveId) {
            errors[nameof(TransferColonyRequest.DestinationHiveId)] = [
                "Destination hive must be different from the current hive."
            ];
        }

        if (transferredOn > today) {
            errors[nameof(TransferColonyRequest.TransferredOn)] = [
                "Transfer date cannot be in the future."
            ];
        }

        if (transferredOn < currentStay.StartedOn) {
            errors[nameof(TransferColonyRequest.TransferredOn)] = [
                "Transfer date cannot be before the current stay started."
            ];
        }

        if (colonyFormedOn is not null &&
            transferredOn < colonyFormedOn) {
            errors[nameof(TransferColonyRequest.TransferredOn)] = [
                "Transfer date cannot be before the colony was formed."
            ];
        }

        return errors;
    }
}
