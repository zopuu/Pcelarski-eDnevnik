using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.GetHiveSupers;

public static class GetHiveSupersEndpoint {
    public static RouteGroupBuilder MapGetHiveSupersEndpoint(
        this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/supers",
                HandleAsync)
            .WithName("GetHiveSupers")
            .Produces<IReadOnlyList<GetHiveSupersResponse>>(
                StatusCodes.Status200OK)
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    private static async Task<IResult> HandleAsync(
        Guid hiveId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);
        var hiveExists =
            await dbContext.Hives
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.Id == hiveId &&
                        x.OwnerBeekeeperId ==
                            beekeeperId,
                    cancellationToken);

        if (!hiveExists) {
            return Results.NotFound();
        }

        /*
         * Return only supers that are CURRENTLY on
         * the requested hive.
         *
         * Active stay:
         *     EndedOn == null
         *
         * Current super:
         *     Status == OnHive
         */
        var supers =
            await (
                from stay in dbContext.HiveSuperStays
                    .AsNoTracking()

                join hiveSuper in dbContext.HiveSupers
                        .AsNoTracking()
                    on stay.HiveSuperId
                    equals hiveSuper.Id

                where
                    stay.HiveId == hiveId &&
                    stay.EndedOn == null &&
                    hiveSuper.OwnerBeekeeperId ==
                        beekeeperId &&
                    hiveSuper.Status ==
                        HiveSuperStatus.OnHive

                orderby
                    stay.StartedOn,
                    hiveSuper.CreatedAtUtc

                select new GetHiveSupersResponse(
                    hiveSuper.Id,
                    hiveSuper.Type,
                    hiveSuper.FrameCount,
                    hiveSuper.Status,
                    hiveSuper.ColorHex,
                    stay.Id,
                    stay.StartedOn)
            )
            .ToListAsync(
                cancellationToken);

        return Results.Ok(
            supers);
    }
}