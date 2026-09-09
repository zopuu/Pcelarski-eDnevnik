using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings.GetById;

public static class GetHoneyFrameFeedingByIdEndpoint {
    public static RouteGroupBuilder
        MapGetHoneyFrameFeedingByIdEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/honey-frame-feedings/{feedingId:guid}",
                HandleAsync)
            .WithName(
                "GetHoneyFrameFeedingById")
            .Produces<HoneyFrameFeedingDetailsResponse>()
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
            await dbContext.HoneyFrameFeedings
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
                        new HoneyFrameFeedingDetailsResponse(
                            feeding.Id,
                            feeding.HiveId,
                            feeding.PerformedAt,
                            feeding.ActionGroupId,
                            feeding.FrameCount,
                            feeding.FrameSource,
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

public sealed record HoneyFrameFeedingDetailsResponse(
    Guid Id,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    Guid? ActionGroupId,
    int FrameCount,
    string? FrameSource,
    string? ImageUrl,
    string? Notes);
