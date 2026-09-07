using System.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings.Record;

public static class RecordHoneyFrameFeedingEndpoint {
    public static RouteGroupBuilder
        MapRecordHoneyFrameFeedingEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
                "/honey-frame-feedings",
                HandleAsync)
            .WithName(
                "RecordHoneyFrameFeeding")
            .Produces<RecordHoneyFrameFeedingResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound)
            .ProducesProblem(
                StatusCodes.Status409Conflict);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        RecordHoneyFrameFeedingRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var selections =
            request.Hives!
                .ToArray();

        var hiveIds =
            selections
                .Select(
                    selection =>
                        selection.HiveId)
                .ToArray();

        if (hiveIds.ToHashSet().Count !=
            hiveIds.Length) {
            return Results.ValidationProblem(
                new Dictionary<string, string[]> {
                    [nameof(request.Hives)] =
                    [
                        "Hive IDs must be unique."
                    ]
                });
        }

        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        await using var transaction =
            await dbContext.Database
                .BeginTransactionAsync(
                    IsolationLevel.Serializable,
                    cancellationToken);

        try {
            var ownedHiveIds =
                await dbContext.Hives
                    .AsNoTracking()
                    .Where(
                        hive =>
                            hiveIds.Contains(
                                hive.Id) &&
                            hive.OwnerBeekeeperId ==
                                beekeeperId)
                    .Select(
                        hive =>
                            hive.Id)
                    .ToListAsync(
                        cancellationToken);

            if (ownedHiveIds.Count !=
                hiveIds.Length) {
                return Results.NotFound();
            }

            var actionGroupId =
                hiveIds.Length > 1
                    ? Guid.NewGuid()
                    : (Guid?)null;

            var actions =
                selections
                    .Select(
                        selection =>
                            HoneyFrameFeeding.Create(
                                selection.HiveId,
                                request.PerformedAt!
                                    .Value,
                                beekeeperId,
                                actionGroupId,
                                request.ImageUrl,
                                request.Notes,
                                selection.FrameCount!
                                    .Value,
                                request.FrameSource))
                    .ToArray();

            dbContext.HoneyFrameFeedings
                .AddRange(
                    actions);

            await dbContext.SaveChangesAsync(
                cancellationToken);

            var totalFrameCount =
                checked(
                    actions.Sum(
                        action =>
                            action.FrameCount));

            await transaction.CommitAsync(
                cancellationToken);

            return Results.Created(
                "/api/hive-actions/honey-frame-feedings",
                new RecordHoneyFrameFeedingResponse(
                    actionGroupId,
                    actions.Length,
                    totalFrameCount));
        }
        catch (Exception exception)
            when (
                HivePersistenceErrors
                    .IsSerializationFailure(
                        exception)) {
            throw new ConflictException(
                "honey_frame_feedings.concurrent_hive_change",
                "A selected hive changed while the feeding was being recorded.",
                exception);
        }
    }
}
