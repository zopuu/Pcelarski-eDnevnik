using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Transfer;

public static class GetTransferDestinationsEndpoint {
    public static RouteGroupBuilder
        MapGetTransferDestinationsEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{colonyId:guid}/transfer-destinations",
                async (
                    Guid colonyId,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var colonyExists =
                        await dbContext.Colonies.AsNoTracking().AnyAsync(
                            colony =>
                                colony.Id == colonyId &&
                                colony.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (!colonyExists) {
                        return Results.NotFound();
                    }

                    var activeStays =
                        await dbContext.ColonyStays.AsNoTracking()
                            .Where(
                                stay =>
                                    stay.ColonyId == colonyId &&
                                    stay.EndedOn == null)
                            .Select(stay => stay.HiveId)
                            .ToListAsync(cancellationToken);

                    if (activeStays.Count != 1) {
                        throw new ConflictException(
                            "colonies.invalid_active_stay_state",
                            "The colony must have exactly one active stay to be transferred.");
                    }

                    var currentHiveId = activeStays[0];
                    var sourceHiveIsOwned =
                        await dbContext.Hives.AsNoTracking().AnyAsync(
                            hive =>
                                hive.Id == currentHiveId &&
                                hive.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (!sourceHiveIsOwned) {
                        return Results.NotFound();
                    }

                    var sourceHiveStay =
                        await dbContext.HiveStays.AsNoTracking()
                            .SingleOrDefaultAsync(
                                stay =>
                                    stay.HiveId == currentHiveId &&
                                    stay.EndedAtUtc == null,
                                cancellationToken);

                    if (sourceHiveStay is null) {
                        throw new ConflictException(
                            "colonies.current_hive_has_no_active_apiary_stay",
                            "The current hive does not have an active apiary stay.");
                    }

                    var destinations =
                        await (
                            from hiveStay in dbContext.HiveStays
                                .AsNoTracking()

                            join hive in dbContext.Hives.AsNoTracking()
                                on hiveStay.HiveId equals hive.Id

                            where
                                hiveStay.ApiaryId == sourceHiveStay.ApiaryId &&
                                hiveStay.EndedAtUtc == null &&
                                hive.Id != currentHiveId &&
                                hive.OwnerBeekeeperId == beekeeperId &&
                                !dbContext.ColonyStays.Any(
                                    stay =>
                                        stay.HiveId == hive.Id &&
                                        stay.EndedOn == null)
                            orderby hive.Label
                            select new GetTransferDestinationsResponse(
                                hive.Id,
                                hive.Label,
                                hive.IdentificationNumber,
                                hive.Type,
                                hive.ColorHex,
                                hive.Status)
                        )
                        .ToListAsync(cancellationToken);

                    return Results.Ok(destinations);
                })
            .WithName("GetColonyTransferDestinations")
            .Produces<IReadOnlyList<GetTransferDestinationsResponse>>(
                StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return group;
    }
}
