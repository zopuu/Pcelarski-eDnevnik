using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.GetById;

public static class GetHiveMaintenanceByIdEndpoint {
    public static RouteGroupBuilder
        MapGetHiveMaintenanceByIdEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/maintenance/{actionId:guid}",
                HandleAsync)
            .WithName(
                "GetHiveMaintenanceById")
            .Produces<HiveMaintenanceDetailsResponse>()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        Guid hiveId,
        Guid actionId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var maintenance =
            await dbContext.HiveMaintenances
                .AsNoTracking()
                .Where(
                    action =>
                        action.Id == actionId &&
                        action.HiveId == hiveId)
                .Join(
                    dbContext.Hives
                        .AsNoTracking()
                        .Where(
                            hive =>
                                hive.OwnerBeekeeperId ==
                                beekeeperId),
                    action => action.HiveId,
                    hive => hive.Id,
                    (action, _) =>
                        new HiveMaintenanceDetailsResponse(
                            action.Id,
                            action.HiveId,
                            action.PerformedAt,
                            action.MaintenanceType,
                            action.CostAmount,
                            action.CurrencyCode,
                            action.ServiceProvider,
                            action.ImageUrl,
                            action.Notes))
                .SingleOrDefaultAsync(
                    cancellationToken);

        return maintenance is null
            ? Results.NotFound()
            : Results.Ok(
                maintenance);
    }
}

public sealed record HiveMaintenanceDetailsResponse(
    Guid Id,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    HiveMaintenanceType MaintenanceType,
    decimal? CostAmount,
    string? CurrencyCode,
    string? ServiceProvider,
    string? ImageUrl,
    string? Notes);
