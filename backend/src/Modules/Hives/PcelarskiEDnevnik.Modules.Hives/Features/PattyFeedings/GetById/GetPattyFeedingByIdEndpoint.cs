using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.GetById;

public static class GetPattyFeedingByIdEndpoint {
    public static RouteGroupBuilder
        MapGetPattyFeedingByIdEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/patty-feedings/{feedingId:guid}",
                HandleAsync)
            .WithName(
                "GetPattyFeedingById")
            .Produces<PattyFeedingDetailsResponse>()
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
            await dbContext.PattyFeedings
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
                        new PattyFeedingDetailsResponse(
                            feeding.Id,
                            feeding.HiveId,
                            feeding.PerformedAt,
                            feeding.ActionGroupId,
                            feeding.MassG,
                            feeding.PattyType,
                            feeding.Manufacturer,
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

public sealed record PattyFeedingDetailsResponse(
    Guid Id,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    Guid? ActionGroupId,
    int MassG,
    PattyType PattyType,
    string? Manufacturer,
    string? ImageUrl,
    string? Notes);
