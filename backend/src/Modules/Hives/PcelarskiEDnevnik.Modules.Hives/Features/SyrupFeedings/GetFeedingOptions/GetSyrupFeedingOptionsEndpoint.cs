using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.GetFeedingOptions;

public static class GetSyrupFeedingOptionsEndpoint {
    public static RouteGroupBuilder
        MapGetSyrupFeedingOptionsEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/feeding-options",
                async (
                    Guid apiaryId,
                    ICurrentBeekeeperContext currentBeekeeper,
                    IApiaryAccessChecker apiaryAccessChecker,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var canAccessApiary =
                        await apiaryAccessChecker
                            .CanAccessAsync(
                                apiaryId,
                                beekeeperId,
                                cancellationToken);

                    if (!canAccessApiary) {
                        return Results.NotFound();
                    }

                    var hives =
                        await (
                            from stay in dbContext.HiveStays
                                .AsNoTracking()

                            join hive in dbContext.Hives
                                .AsNoTracking()
                                on stay.HiveId equals hive.Id

                            where
                                stay.ApiaryId == apiaryId &&
                                stay.EndedAtUtc == null &&
                                hive.OwnerBeekeeperId == beekeeperId &&
                                hive.HasFeeder &&
                                hive.FeederVolumeMl > 0

                            orderby hive.Label

                            select new SyrupFeedingHiveOptionResponse(
                                hive.Id,
                                hive.FeederVolumeMl!.Value)
                        )
                        .ToListAsync(
                            cancellationToken);

                    return Results.Ok(
                        hives);
                })
            .WithName(
                "GetSyrupFeedingHiveOptions")
            .Produces<IReadOnlyList<
                SyrupFeedingHiveOptionResponse>>(
                StatusCodes.Status200OK)
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }
}
