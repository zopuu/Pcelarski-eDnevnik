using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetCurrent;

public static class GetCurrentApiaryStayEndpoint {
    public static IEndpointRouteBuilder MapGetCurrentApiaryStayEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/current",
            async (
                Guid apiaryId,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var currentStay =
                        await (
                            from stay in
                                dbContext.ApiaryStays
                                    .AsNoTracking()

                            join apiary in
                                dbContext.Apiaries
                                    .AsNoTracking()
                                on stay.ApiaryId
                                equals apiary.Id

                            where
                                stay.ApiaryId ==
                                    apiaryId &&
                                stay.EndedAtUtc ==
                                    null &&
                                apiary.OwnerBeekeeperId ==
                                    beekeeperId

                            select new
                                GetCurrentApiaryStayResponse(
                                    stay.Id,
                                    stay.ApiaryId,
                                    stay.LocationId,
                                    stay.StartedAtUtc,
                                    stay.EndedAtUtc,
                                    stay.Orientation,
                                    stay.Note,
                                    true,
                                    stay.CreatedAtUtc,
                                    stay.UpdatedAtUtc)
                        )
                        .SingleOrDefaultAsync(
                            cancellationToken);

                    if (currentStay is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(
                        currentStay);
                });

        return endpoints;
    }
}