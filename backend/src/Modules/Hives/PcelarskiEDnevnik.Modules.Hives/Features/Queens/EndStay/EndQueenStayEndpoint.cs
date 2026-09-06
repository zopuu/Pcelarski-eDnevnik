using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.EndStay;

public static class EndQueenStayEndpoint {
    public static RouteGroupBuilder MapEndQueenStayEndpoint(
        this RouteGroupBuilder group) {
        group.MapPost(
                "/{colonyId:guid}/end-queen-stay",
                async (
                    Guid colonyId,
                    EndQueenStayRequest request,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var colonyExists =
                        await dbContext.Colonies.AsNoTracking().AnyAsync(
                            colony =>
                                colony.Id == colonyId &&
                                colony.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (!colonyExists) {
                        return Results.NotFound();
                    }

                    var currentStay =
                        await dbContext.QueenStays.SingleOrDefaultAsync(
                            stay =>
                                stay.ColonyId == colonyId &&
                                stay.EndedOn == null,
                            cancellationToken);

                    if (currentStay is null) {
                        throw new ConflictException(
                            "queens.colony_has_no_active_queen",
                            "The colony does not have an active queen.");
                    }

                    var queen =
                        await dbContext.Queens.SingleOrDefaultAsync(
                            item =>
                                item.Id == currentStay.QueenId &&
                                item.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (queen is null) {
                        return Results.NotFound();
                    }

                    var endedOn = request.EndedOn!.Value;
                    var validationErrors = Validate(
                        request,
                        currentStay.StartedOn,
                        endedOn);

                    if (validationErrors.Count > 0) {
                        return Results.ValidationProblem(validationErrors);
                    }

                    await using var transaction =
                        await dbContext.Database.BeginTransactionAsync(
                            cancellationToken);

                    currentStay.End(
                        endedOn,
                        request.EndReason!.Value);
                    queen.SetStatus(request.QueenStatus!.Value);

                    await dbContext.SaveChangesAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);

                    return Results.Ok(
                        new EndQueenStayResponse(
                            queen.Id,
                            currentStay.Id,
                            currentStay.EndedOn!.Value,
                            currentStay.EndReason!.Value,
                            queen.Status));
                })
            .WithName("EndQueenStay")
            .Produces<EndQueenStayResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return group;
    }

    private static Dictionary<string, string[]> Validate(
        EndQueenStayRequest request,
        DateOnly startedOn,
        DateOnly endedOn) {
        var errors = new Dictionary<string, string[]>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (endedOn > today) {
            errors[nameof(request.EndedOn)] =
                ["Queen stay end date cannot be in the future."];
        }

        if (endedOn < startedOn) {
            errors[nameof(request.EndedOn)] =
                ["Queen stay end date cannot be before its start date."];
        }

        if (request.EndReason == QueenStayEndReason.Replaced) {
            errors[nameof(request.EndReason)] =
                ["Use the queen change workflow when replacing a queen."];
        }

        if (
            request.EndReason == QueenStayEndReason.Dead &&
            request.QueenStatus != QueenStatus.Dead) {
            errors[nameof(request.QueenStatus)] =
                ["A dead queen must have the dead status."];
        }

        if (
            request.EndReason == QueenStayEndReason.Killed &&
            request.QueenStatus != QueenStatus.Killed) {
            errors[nameof(request.QueenStatus)] =
                ["A killed queen must have the killed status."];
        }

        if (
            request.EndReason == QueenStayEndReason.Removed &&
            request.QueenStatus is not QueenStatus.Sold and
                not QueenStatus.Removed) {
            errors[nameof(request.QueenStatus)] =
                ["A removed queen must have the sold or removed status."];
        }

        if (
            request.EndReason == QueenStayEndReason.Swarmed &&
            request.QueenStatus != QueenStatus.Active) {
            errors[nameof(request.QueenStatus)] =
                ["A swarmed queen must remain active."];
        }

        return errors;
    }
}
