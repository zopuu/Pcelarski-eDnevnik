using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using Microsoft.AspNetCore.Builder;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.GetById;

public static class GetHiveByIdEndpoint {
    public static RouteGroupBuilder MapGetHiveByIdEndpoint(
        this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}",
                async (
                    Guid hiveId,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                        var beekeeperId =
                            await currentBeekeeper
                                .GetBeekeeperIdAsync(
                                    cancellationToken);

                        var hive =
                            await dbContext.Hives
                                .AsNoTracking()
                                .Where(
                                    x =>
                                        x.Id == hiveId &&
                                        x.OwnerBeekeeperId ==
                                        beekeeperId)
                                .Select(
                                    x =>
                                        new GetHiveByIdResponse(
                                            x.Id,
                                            x.IdentificationNumber,
                                            x.Label,
                                            x.Type,
                                            x.ColorHex,
                                            x.Status,
                                            x.ManufactureDate,
                                            x.Manufacturer,
                                            x.Material,
                                            x.PurchaseDate,
                                            x.HasFeeder,
                                            x.FeederVolumeMl,
                                            x.Note,
                                            x.CreatedAtUtc,
                                            x.UpdatedAtUtc))
                                .SingleOrDefaultAsync(
                                    cancellationToken);

                        if (hive is null) {
                            return Results.NotFound();
                        }

                        return Results.Ok(hive);
                    })
            .WithName("GetHiveById")
            .Produces<GetHiveByIdResponse>(
                StatusCodes.Status200OK)
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }
}