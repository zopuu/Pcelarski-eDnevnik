using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.Change;

public static class ChangeQueenEndpoint {
    public static RouteGroupBuilder
        MapChangeQueenEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
            "/{colonyId:guid}/change-queen",
            async (
                Guid colonyId,
                ChangeQueenRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId = await currentBeekeeper
                        .GetBeekeeperIdAsync(cancellationToken);

                    if ((request.ExistingQueenId is null) == (request.NewQueen is null)) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                [nameof(request.ExistingQueenId)] = [
                                    "Select an existing queen or provide a new queen."
                                ]
                        });
                    }

                    if (request.IntroductionMethod is null) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                [nameof(request.IntroductionMethod)] = [
                                    "Introduction method is required."
                                ]
                            });
                    }

                    if (request.NewQueen is not null &&
                        request.NewQueen.Origin is null) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                [nameof(request.NewQueen.Origin)] = [
                                    "Queen origin is required."
                                ]
                            });
                    }

                    var colony = await dbContext.Colonies
                        .AsNoTracking()
                        .SingleOrDefaultAsync(
                            item => item.Id == colonyId &&
                                item.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (colony is null) {
                        return Results.NotFound();
                    }

                    if (colony.Status != ColonyStatus.Active) {
                        throw new ConflictException(
                            "queens.colony_not_active",
                            "A queen cannot be assigned to an inactive colony.");
                    }

                    var activeColonyStayStartedOn = await dbContext.ColonyStays
                        .AsNoTracking()
                        .Where(stay => stay.ColonyId == colonyId && stay.EndedOn == null)
                        .Select(stay => (DateOnly?)stay.StartedOn)
                        .SingleOrDefaultAsync(cancellationToken);

                    if (activeColonyStayStartedOn is null) {
                        throw new ConflictException(
                            "queens.colony_has_no_active_stay",
                            "A queen cannot be assigned to a colony without an active stay.");
                    }

                    var currentStay = await dbContext.QueenStays
                        .SingleOrDefaultAsync(
                            stay => stay.ColonyId == colonyId && stay.EndedOn == null,
                            cancellationToken);

                    if (currentStay is null) {
                        throw new ConflictException(
                            "queens.colony_has_no_active_queen",
                            "The colony does not have an active queen to replace.");
                    }

                    var previousQueen = await dbContext.Queens
                        .SingleAsync(
                            queen => queen.Id == currentStay.QueenId &&
                                queen.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    var changedOn = request.ChangedOn!.Value;
                    var today = DateOnly.FromDateTime(DateTime.UtcNow);

                    if (changedOn > today) {
                        return DateValidationProblem(
                            nameof(request.ChangedOn),
                            "Queen change date cannot be in the future.");
                    }

                    if (changedOn < currentStay.StartedOn ||
                        changedOn < activeColonyStayStartedOn) {
                        return DateValidationProblem(
                            nameof(request.ChangedOn),
                            "Queen change date cannot be before the current stay.");
                    }

                    if (request.CurrentQueenEndReason ==
                        QueenStayEndReason.Dead &&
                        request.CurrentQueenStatus != QueenStatus.Dead) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                [nameof(request.CurrentQueenStatus)] = [
                                    "A dead queen must have the dead status."
                                ]
                            });
                    }

                    await using var transaction = await dbContext.Database
                        .BeginTransactionAsync(cancellationToken);

                    currentStay.End(
                        changedOn,
                        request.CurrentQueenEndReason);
                    previousQueen.SetStatus(request.CurrentQueenStatus);

                    Queen newQueen;

                    if (request.ExistingQueenId is Guid existingQueenId) {
                        if (existingQueenId == previousQueen.Id) {
                            throw new ConflictException(
                                "queens.replacement_must_differ",
                                "The replacement queen must differ from the current queen.");
                        }

                        newQueen = await dbContext.Queens
                            .SingleOrDefaultAsync(
                                queen => queen.Id == existingQueenId &&
                                    queen.OwnerBeekeeperId == beekeeperId,
                                cancellationToken)
                            ?? throw new NotFoundException(
                                "queens.replacement_not_found",
                                "The requested replacement queen was not found.");

                        if (newQueen.Status != QueenStatus.Active) {
                            throw new ConflictException(
                                "queens.replacement_not_available",
                                "Only an active queen can be assigned to a colony.");
                        }

                        if (newQueen.EmergedOn > changedOn) {
                            return DateValidationProblem(
                                nameof(request.ChangedOn),
                                "Queen change date cannot be before the replacement queen emerged.");
                        }
                    }
                    else {
                        var newQueenRequest = request.NewQueen!;
                        var validationProblem = ValidateNewQueen(
                            newQueenRequest,
                            changedOn,
                            today);

                        if (validationProblem is not null) {
                            return validationProblem;
                        }

                        newQueen = Queen.Create(
                            beekeeperId,
                            newQueenRequest.MarkingColorHex,
                            newQueenRequest.Origin,
                            newQueenRequest.Breeder,
                            newQueenRequest.Breed,
                            newQueenRequest.EmergedOn,
                            newQueenRequest.AcquiredOn,
                            newQueenRequest.Notes);
                        dbContext.Queens.Add(newQueen);
                    }

                    var replacementHasActiveStay = await dbContext.QueenStays
                        .AsNoTracking()
                        .AnyAsync(
                            stay => stay.QueenId == newQueen.Id && stay.EndedOn == null,
                            cancellationToken);

                    if (replacementHasActiveStay) {
                        throw new ConflictException(
                            "queens.replacement_already_assigned",
                            "The replacement queen already belongs to a colony.");
                    }

                    var newStay = QueenStay.Start(
                        newQueen.Id,
                        colonyId,
                        changedOn,
                        request.IntroductionMethod,
                        null,
                        request.NewQueenStayNotes);
                    dbContext.QueenStays.Add(newStay);

                    try {
                        await dbContext.SaveChangesAsync(cancellationToken);
                        await transaction.CommitAsync(cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (QueenPersistenceErrors.IsActiveColonyConflict(exception)) {
                        throw new ConflictException(
                            "queens.colony_already_has_active_queen",
                            "The colony already has an active queen.",
                            exception);
                    }
                    catch (DbUpdateException exception)
                        when (QueenPersistenceErrors.IsActiveQueenConflict(exception)) {
                        throw new ConflictException(
                            "queens.replacement_already_assigned",
                            "The replacement queen already belongs to a colony.",
                            exception);
                    }

                    return Results.Ok(new ChangeQueenResponse(
                        previousQueen.Id,
                        currentStay.Id,
                        newQueen.Id,
                        newStay.Id));
                })
            .Produces<ChangeQueenResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return group;
    }

    private static IResult? ValidateNewQueen(
        NewQueenForChangeRequest request,
        DateOnly changedOn,
        DateOnly today) {
        if (request.EmergedOn > today || request.AcquiredOn > today) {
            return DateValidationProblem(
                nameof(request.EmergedOn),
                "Queen dates cannot be in the future.");
        }

        if (request.EmergedOn is DateOnly emergedOn &&
            request.AcquiredOn is DateOnly acquiredOn &&
            acquiredOn < emergedOn) {
            return DateValidationProblem(
                nameof(request.AcquiredOn),
                "Queen acquisition date cannot be before emergence date.");
        }

        if (request.EmergedOn is DateOnly queenEmergedOn &&
            changedOn < queenEmergedOn) {
            return DateValidationProblem(
                nameof(ChangeQueenRequest.ChangedOn),
                "Queen change date cannot be before the new queen emerged.");
        }

        return null;
    }

    private static IResult DateValidationProblem(
        string field,
        string error) {
        return Results.ValidationProblem(
            new Dictionary<string, string[]> {
                [field] = [error]
            });
    }
}
