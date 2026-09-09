using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.GetById;

public static class GetSyrupFeedingByIdEndpoint {
    public static RouteGroupBuilder
        MapGetSyrupFeedingByIdEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/syrup-feedings/{feedingId:guid}",
                HandleAsync)
            .WithName(
                "GetSyrupFeedingById")
            .Produces<SyrupFeedingDetailsResponse>()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        Guid hiveId,
        Guid feedingId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var feeding =
            await dbContext.SyrupFeedings
                .AsNoTracking()
                .Where(
                    feeding =>
                        feeding.Id == feedingId &&
                        feeding.HiveId == hiveId)
                .Join(
                    dbContext.Hives
                        .AsNoTracking()
                        .Where(
                            hive =>
                                hive.OwnerBeekeeperId ==
                                beekeeperId),
                    feeding =>
                        feeding.HiveId,
                    hive =>
                        hive.Id,
                    (feeding, _) =>
                        new SyrupFeedingDetailsResponse(
                            feeding.Id,
                            feeding.HiveId,
                            feeding.PerformedAt,
                            feeding.ActionGroupId,
                            feeding.QuantityMl,
                            feeding.SugarParts,
                            feeding.WaterParts,
                            feeding.Additives,
                            feeding.ImageUrl,
                            feeding.Notes))
                .SingleOrDefaultAsync(
                    cancellationToken);

        return feeding is null
            ? Results.NotFound()
            : Results.Ok(
                feeding);
    }
}

public sealed record SyrupFeedingDetailsResponse(
    Guid Id,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    Guid? ActionGroupId,
    int QuantityMl,
    decimal SugarParts,
    decimal WaterParts,
    string? Additives,
    string? ImageUrl,
    string? Notes);
