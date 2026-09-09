using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.GetById;

public static class GetHiveInsulationByIdEndpoint {
    public static RouteGroupBuilder
        MapGetHiveInsulationByIdEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/insulation/{actionId:guid}",
                HandleAsync)
            .WithName(
                "GetHiveInsulationById")
            .Produces<HiveInsulationDetailsResponse>()
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

        var insulation =
            await dbContext.HiveInsulations
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
                    action =>
                        action.HiveId,
                    hive =>
                        hive.Id,
                    (action, _) =>
                        new HiveInsulationDetailsResponse(
                            action.Id,
                            action.HiveId,
                            action.PerformedAt,
                            action.ActionGroupId,
                            action.Operation,
                            action.Paper,
                            action.Eps,
                            action.Xps,
                            action.ImageUrl,
                            action.Notes))
                .SingleOrDefaultAsync(
                    cancellationToken);

        return insulation is null
            ? Results.NotFound()
            : Results.Ok(
                insulation);
    }
}

public sealed record HiveInsulationDetailsResponse(
    Guid Id,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    Guid? ActionGroupId,
    HiveInsulationOperation Operation,
    bool Paper,
    bool Eps,
    bool Xps,
    string? ImageUrl,
    string? Notes);
