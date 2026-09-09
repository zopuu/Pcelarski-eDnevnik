using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.VaroaTreatment;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.Record;

public static class RecordVarroaTreatmentEndpoint {
    public static RouteGroupBuilder
        MapRecordVarroaTreatmentEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
                "/varroa-treatments",
                HandleAsync)
            .WithName(
                "RecordVarroaTreatment")
            .Produces<RecordVarroaTreatmentResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        RecordVarroaTreatmentRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var hiveIds =
            request.HiveIds!
                .ToArray();

        if (hiveIds.ToHashSet().Count !=
            hiveIds.Length) {
            return Results.ValidationProblem(
                new Dictionary<string, string[]> {
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
            hiveIds
                .Select(
                    hiveId =>
                        VarroaTreatment.Create(
                            hiveId,
                            request.PerformedAt!
                                .Value,
                            beekeeperId,
                            actionGroupId,
                            request.ImageUrl,
                            request.Notes,
                            request.ProductName!,
                            request.ApplicationMethod!
                                .Value,
                            request.DoseAmount!
                                .Value,
                            request.DoseUnit!
                                .Value))
                .ToArray();

        dbContext.VarroaTreatments
            .AddRange(
                actions);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        var totalDoseAmount =
            actions.Sum(
                action =>
                    action.DoseAmount);

        var representativeAction =
            actions[0];

        return Results.Created(
            "/api/hive-actions/varroa-treatments",
            new RecordVarroaTreatmentResponse(
                actionGroupId,
                actions.Length,
                representativeAction.ProductName,
                representativeAction.ApplicationMethod,
                representativeAction.DoseAmount,
                representativeAction.DoseUnit,
                totalDoseAmount));
    }
}
