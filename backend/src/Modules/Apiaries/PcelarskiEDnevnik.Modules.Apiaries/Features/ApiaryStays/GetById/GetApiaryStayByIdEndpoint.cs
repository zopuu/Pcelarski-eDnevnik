using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetById;

public static class GetApiaryStayByIdEndpoint {
    public static IEndpointRouteBuilder MapGetApiaryStayByIdEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/{stayId:guid}",
            async (
                Guid apiaryId,
                Guid stayId,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var apiaryExists =
                        await dbContext.Apiaries
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.Id == apiaryId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId &&
                                    x.Status == PcelarskiEDnevnik.Modules.Apiaries.Domain.ApiaryStatus.Active,
                                cancellationToken);

                    if (!apiaryExists) {
                        return Results.NotFound();
                    }

                    var stay =
                        await (
                            from apiaryStay
                                in dbContext.ApiaryStays
                                    .AsNoTracking()
                            join location
                                in dbContext.Locations
                                    .AsNoTracking()
                                on apiaryStay.LocationId
                                equals location.Id
                            where
                                apiaryStay.Id == stayId
                                &&
                                apiaryStay.ApiaryId ==
                                apiaryId
                            select new GetApiaryStayByIdResponse(
                                apiaryStay.Id,
                                apiaryStay.ApiaryId,
                                apiaryStay.LocationId,
                                location.Name,
                                location.Latitude,
                                location.Longitude,
                                location.AltitudeMeters,
                                apiaryStay.StartedAtUtc,
                                apiaryStay.EndedAtUtc,
                                apiaryStay.Orientation,
                                apiaryStay.Note,
                                apiaryStay.EndedAtUtc == null,
                                apiaryStay.CreatedAtUtc,
                                apiaryStay.UpdatedAtUtc)
                        )
                        .SingleOrDefaultAsync(
                            cancellationToken);

                    if (stay is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(stay);
                });

        return endpoints;
    }
}
