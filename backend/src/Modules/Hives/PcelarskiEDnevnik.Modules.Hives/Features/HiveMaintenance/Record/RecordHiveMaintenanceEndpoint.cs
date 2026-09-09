using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using HiveMaintenanceAction =
    PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance.HiveMaintenance;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Record;

public static class RecordHiveMaintenanceEndpoint {
    public static RouteGroupBuilder
        MapRecordHiveMaintenanceEndpoint(
            this RouteGroupBuilder group) {
        group.MapPost(
                "",
                HandleAsync)
            .WithName(
                "RecordHiveMaintenance")
            .Produces<RecordHiveMaintenanceResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        RecordHiveMaintenanceRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var hive =
            await dbContext.Hives
                .SingleOrDefaultAsync(
                    candidate =>
                        candidate.Id ==
                            request.HiveId!.Value &&
                        candidate.OwnerBeekeeperId ==
                            beekeeperId,
                    cancellationToken);

        if (hive is null) {
            return Results.NotFound();
        }

        var maintenance =
            HiveMaintenanceAction.Create(
                hive.Id,
                request.PerformedAt!.Value,
                beekeeperId,
                request.ImageUrl,
                request.Notes,
                request.MaintenanceType!.Value,
                request.CostAmount,
                request.CurrencyCode,
                request.ServiceProvider);

        dbContext.HiveMaintenances.Add(
            maintenance);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        return Results.Created(
            $"/api/hive-actions/hive-maintenance/{maintenance.Id}",
            new RecordHiveMaintenanceResponse(
                maintenance.Id,
                maintenance.HiveId,
                maintenance.MaintenanceType,
                maintenance.CostAmount,
                maintenance.CurrencyCode,
                maintenance.ServiceProvider,
                hive.Status));
    }
}
