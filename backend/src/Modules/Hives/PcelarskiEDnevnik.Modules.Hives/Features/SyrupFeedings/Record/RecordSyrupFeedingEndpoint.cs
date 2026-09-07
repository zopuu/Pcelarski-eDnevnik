using System.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.Record;

public static class RecordSyrupFeedingEndpoint {
    public static RouteGroupBuilder
        MapRecordSyrupFeedingEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
                "/syrup-feedings",
                async (
                    RecordSyrupFeedingRequest request,
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
                        var hives =
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
                                        new FeedingHive(
                                            hive.Id,
                                            hive.HasFeeder,
                                            hive.FeederVolumeMl))
                                .ToListAsync(
                                    cancellationToken);

                        if (hives.Count !=
                            hiveIds.Length) {
                            return Results.NotFound();
                        }

                        if (hives.Any(
                            hive =>
                                !hive.HasFeeder)) {
                            throw new ConflictException(
                                "syrup_feedings.feeder_required",
                                "Every selected hive must currently have a feeder.");
                        }

                        if (hives.Any(
                            hive =>
                                hive.FeederCapacityMl is null ||
                                hive.FeederCapacityMl <= 0)) {
                            throw new ConflictException(
                                "syrup_feedings.invalid_feeder_capacity",
                                "Every selected hive must have a positive feeder capacity.");
                        }

                        var hivesById =
                            hives.ToDictionary(
                                hive => hive.Id);

                        var actionGroupId =
                            hiveIds.Length > 1
                                ? Guid.NewGuid()
                                : (Guid?)null;

                        var actions =
                            selections
                                .Select(
                                    selection => {
                                        var hive =
                                            hivesById[
                                                selection.HiveId];

                                        var quantityMl =
                                            SyrupFeedingCalculator
                                                .CalculateQuantityMl(
                                                    hive.FeederCapacityMl!
                                                        .Value,
                                                    selection.FillPercentage!
                                                        .Value);

                                        return SyrupFeeding.Create(
                                            hive.Id,
                                            request.PerformedAt!
                                                .Value,
                                            beekeeperId,
                                            actionGroupId,
                                            request.ImageUrl,
                                            request.Notes,
                                            quantityMl,
                                            request.SugarParts!
                                                .Value,
                                            request.WaterParts!
                                                .Value,
                                            request.Additives);
                                    })
                                .ToArray();

                        var totalSyrupMl =
                            checked(
                                actions.Sum(
                                    action =>
                                        action.QuantityMl));

                        var ingredientEstimate =
                            SyrupFeedingCalculator
                                .CalculateIngredientEstimate(
                                    totalSyrupMl,
                                    request.SugarParts!
                                        .Value,
                                    request.WaterParts!
                                        .Value);

                        dbContext.SyrupFeedings
                            .AddRange(
                                actions);

                        await dbContext.SaveChangesAsync(
                            cancellationToken);

                        await transaction.CommitAsync(
                            cancellationToken);

                        return Results.Created(
                            "/api/hive-actions/syrup-feedings",
                            new RecordSyrupFeedingResponse(
                                actionGroupId,
                                actions.Length,
                                totalSyrupMl,
                                ingredientEstimate
                                    .EstimatedSugarKg,
                                ingredientEstimate
                                    .EstimatedWaterKg,
                                actions
                                    .Select(
                                        action =>
                                            new RecordedSyrupFeedingResponse(
                                                action.Id,
                                                action.HiveId,
                                                action.QuantityMl))
                                    .ToArray()));
                    }
                    catch (Exception exception)
                        when (
                            HivePersistenceErrors
                                .IsSerializationFailure(
                                    exception)) {
                        throw new ConflictException(
                            "syrup_feedings.concurrent_hive_change",
                            "A selected hive changed while the feeding was being recorded.",
                            exception);
                    }
                })
            .WithName(
                "RecordSyrupFeeding")
            .Produces<RecordSyrupFeedingResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound)
            .ProducesProblem(
                StatusCodes.Status409Conflict);

        return group;
    }

    private sealed record FeedingHive(
        Guid Id,
        bool HasFeeder,
        int? FeederCapacityMl);
}
