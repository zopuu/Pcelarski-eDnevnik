using System.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;
using HiveInsulationAction =
    PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInsulation;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.Record;

public static class RecordHiveInsulationEndpoint {
    public static RouteGroupBuilder
        MapRecordHiveInsulationEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
                "/insulation",
                async (
                    RecordHiveInsulationRequest request,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                    var hiveIds =
                        request.HiveIds!
                            .ToArray();

                    if (hiveIds.ToHashSet().Count !=
                        hiveIds.Length) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [nameof(request.HiveIds)] =
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
                        var states =
                            await HiveInsulationStateReader
                                .ReadOwnedAsync(
                                    dbContext,
                                    beekeeperId,
                                    hiveIds,
                                    request.PerformedAt!
                                        .Value,
                                    cancellationToken);

                        if (states.Count !=
                            hiveIds.Length) {
                            return Results.NotFound();
                        }

                        ValidateCurrentState(
                            request,
                            states);

                        var actionGroupId =
                            hiveIds.Length > 1
                                ? Guid.NewGuid()
                                : (Guid?)null;

                        var actions =
                            hiveIds
                                .Select(
                                    hiveId =>
                                        HiveInsulationAction
                                            .Create(
                                                hiveId,
                                                request.PerformedAt!
                                                    .Value,
                                                beekeeperId,
                                                actionGroupId,
                                                request.ImageUrl,
                                                request.Notes,
                                                request.Operation!
                                                    .Value,
                                                request.Paper,
                                                request.Eps,
                                                request.Xps))
                                .ToArray();

                        dbContext.HiveInsulations
                            .AddRange(
                                actions);

                        await dbContext.SaveChangesAsync(
                            cancellationToken);

                        await transaction.CommitAsync(
                            cancellationToken);

                        return Results.Created(
                            "/api/hive-actions/insulation",
                            new RecordHiveInsulationResponse(
                                actionGroupId,
                                actions
                                    .Select(
                                        action =>
                                            new RecordedHiveInsulationResponse(
                                                action.Id,
                                                action.HiveId))
                                    .ToArray()));
                    }
                    catch (Exception exception)
                        when (
                            HivePersistenceErrors
                                .IsSerializationFailure(
                                    exception)) {
                        throw new ConflictException(
                            "hive_insulation.concurrent_state_change",
                            "The insulation state changed while the action was being recorded.",
                            exception);
                    }
                })
            .WithName(
                "RecordHiveInsulation")
            .Produces<RecordHiveInsulationResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound)
            .ProducesProblem(
                StatusCodes.Status409Conflict);

        return group;
    }

    private static void ValidateCurrentState(
        RecordHiveInsulationRequest request,
        IReadOnlyList<HiveInsulationState> states) {
        var performedAt =
            request.PerformedAt!.Value;

        var isNotAfterLatestAction =
            states.Any(
                state =>
                    (request.Paper &&
                     state.LatestPaperPerformedAt
                         is DateTimeOffset latestPaperPerformedAt &&
                     performedAt <=
                     latestPaperPerformedAt) ||
                    (request.Eps &&
                     state.LatestEpsPerformedAt
                         is DateTimeOffset latestEpsPerformedAt &&
                     performedAt <=
                     latestEpsPerformedAt) ||
                    (request.Xps &&
                     state.LatestXpsPerformedAt
                         is DateTimeOffset latestXpsPerformedAt &&
                     performedAt <=
                     latestXpsPerformedAt));

        if (isNotAfterLatestAction) {
            throw new ConflictException(
                "hive_insulation.performed_at_before_latest_action",
                "The insulation action must be recorded after the latest action for every selected insulation type.");
        }

        var conflicts =
            request.Operation ==
            HiveInsulationOperation.Add
                ? states.Any(
                    state =>
                        (request.Paper &&
                         state.Paper) ||
                        (request.Eps &&
                         state.Eps) ||
                        (request.Xps &&
                         state.Xps))
                : states.Any(
                    state =>
                        (request.Paper &&
                         !state.Paper) ||
                        (request.Eps &&
                         !state.Eps) ||
                        (request.Xps &&
                         !state.Xps));

        if (!conflicts) {
            return;
        }

        if (request.Operation ==
            HiveInsulationOperation.Add) {
            throw new ConflictException(
                "hive_insulation.selected_type_already_present",
                "One or more selected insulation types are already present on a selected hive.");
        }

        throw new ConflictException(
            "hive_insulation.selected_type_not_present",
            "One or more selected insulation types are not present on a selected hive.");
    }
}
