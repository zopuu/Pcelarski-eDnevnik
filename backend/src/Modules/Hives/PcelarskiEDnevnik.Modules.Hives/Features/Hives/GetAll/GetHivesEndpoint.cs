using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.GetAll;

public static class GetHivesEndpoint {
    public static IEndpointRouteBuilder MapGetHivesEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/",
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
                                hive.OwnerBeekeeperId == beekeeperId

                            orderby hive.Label

                            select new HiveListItemResponse(
                                hive.Id,
                                hive.IdentificationNumber,
                                hive.Label,
                                hive.Type,
                                hive.ColorHex,
                                hive.Status)
                        )
                        .ToListAsync(
                            cancellationToken);

                    return Results.Ok(
                        hives);
                });

        return endpoints;
    }
}
