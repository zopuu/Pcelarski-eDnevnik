using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetAll;

public static class GetApiaryStaysEndpoint {
    public static IEndpointRouteBuilder MapGetApiaryStaysEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/",
            async (
                Guid apiaryId,
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

                    var stays =
                        await (
                            from stay in dbContext.ApiaryStays
                                .AsNoTracking()
                            join location in dbContext.Locations
                                .AsNoTracking()
                                on stay.LocationId equals location.Id
                            where stay.ApiaryId == apiaryId
                            orderby stay.StartedAtUtc descending
                            select new ApiaryStayListItemResponse(
                                stay.Id,
                                stay.LocationId,
                                location.Name,
                                stay.StartedAtUtc,
                                stay.EndedAtUtc,
                                stay.Orientation,
                                stay.EndedAtUtc == null)
                        )
                        .ToListAsync(
                            cancellationToken);

                    return Results.Ok(stays);
                });

        return endpoints;
    }
}
