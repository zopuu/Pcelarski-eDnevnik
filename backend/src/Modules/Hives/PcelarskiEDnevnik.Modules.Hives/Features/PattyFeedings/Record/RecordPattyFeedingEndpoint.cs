using System.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.PattyFeeding;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.Record;

public static class RecordPattyFeedingEndpoint {
    public static RouteGroupBuilder
        MapRecordPattyFeedingEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
                "/patty-feedings",
                async (
                    RecordPattyFeedingRequest request,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
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
                                        PattyFeeding.Create(
                                            selection.HiveId,
                                            request.PerformedAt!
                                                .Value,
                                            beekeeperId,
                                            actionGroupId,
                                            request.ImageUrl,
                                            request.Notes,
                                            PattyFeedingCalculator
                                                .CalculateMassG(
                                                    request.PattyMassG!
                                                        .Value,
                                                    selection.Percentage!
                                                        .Value),
                                            request.PattyType!
                                                .Value,
                                            request.Manufacturer))
                                .ToArray();

                        var totalMassG =
                            checked(
                                actions.Sum(
                                    action =>
                                        action.MassG));

                        dbContext.PattyFeedings
                            .AddRange(
                                actions);

                        await dbContext.SaveChangesAsync(
                            cancellationToken);

                        await transaction.CommitAsync(
                            cancellationToken);

                        return Results.Created(
                            "/api/hive-actions/patty-feedings",
                            new RecordPattyFeedingResponse(
                                actionGroupId,
                                actions.Length,
                                totalMassG));
                    }
                    catch (Exception exception)
                        when (
                            HivePersistenceErrors
                                .IsSerializationFailure(
                                    exception)) {
                        throw new ConflictException(
                            "patty_feedings.concurrent_hive_change",
                            "A selected hive changed while the feeding was being recorded.",
                            exception);
                    }
                })
            .WithName(
                "RecordPattyFeeding")
            .Produces<RecordPattyFeedingResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound)
            .ProducesProblem(
                StatusCodes.Status409Conflict);

        return group;
    }
}
