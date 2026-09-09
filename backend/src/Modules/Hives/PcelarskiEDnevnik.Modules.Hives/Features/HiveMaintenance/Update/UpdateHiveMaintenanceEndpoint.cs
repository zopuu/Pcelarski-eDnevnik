using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Update;

public static class UpdateHiveMaintenanceEndpoint {
    public static RouteGroupBuilder
        MapUpdateHiveMaintenanceEndpoint(
            this RouteGroupBuilder group) {
        group.MapPut(
                "/{actionId:guid}",
                HandleAsync)
            .WithName(
                "UpdateHiveMaintenance")
            .Produces<UpdateHiveMaintenanceResponse>(
                StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        Guid actionId,
        UpdateHiveMaintenanceRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var maintenance =
            await (
                    from candidate in
                        dbContext.HiveMaintenances
                    join hive in dbContext.Hives
                        on candidate.HiveId equals hive.Id
                    where candidate.Id == actionId &&
                        hive.OwnerBeekeeperId == beekeeperId
                    select candidate)
                .SingleOrDefaultAsync(
                    cancellationToken);

        if (maintenance is null) {
            return Results.NotFound();
        }

        maintenance.UpdateDetails(
            request.MaintenanceType!.Value,
            request.CostAmount,
            request.CurrencyCode,
            request.ServiceProvider);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        return Results.Ok(
            new UpdateHiveMaintenanceResponse(
                maintenance.Id,
                maintenance.HiveId,
                maintenance.MaintenanceType,
                maintenance.CostAmount,
                maintenance.CurrencyCode,
                maintenance.ServiceProvider));
    }
}
