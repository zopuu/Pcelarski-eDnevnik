using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Update;

public static class UpdateApiaryStayEndpoint {
    public static IEndpointRouteBuilder MapUpdateApiaryStayEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut(
            "/{stayId:guid}",
            async (
                Guid apiaryId,
                Guid stayId,
                UpdateApiaryStayRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var stay =
                        await dbContext.ApiaryStays
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == stayId &&
                                    x.ApiaryId == apiaryId &&
                                    x.EndedAtUtc == null &&
                                    dbContext.Apiaries.Any(
                                        apiary =>
                                            apiary.Id ==
                                                x.ApiaryId &&
                                            apiary.OwnerBeekeeperId ==
                                                beekeeperId &&
                                            apiary.Status ==
                                                PcelarskiEDnevnik.Modules.Apiaries.Domain.ApiaryStatus.Active),
                                cancellationToken);

                    if (stay is null) {
                        return Results.NotFound();
                    }

                    stay.UpdateOrientation(
                        request.Orientation);

                    await dbContext.SaveChangesAsync(
                        cancellationToken);

                    var response =
                        new UpdateApiaryStayResponse(
                            stay.Id,
                            stay.ApiaryId,
                            stay.LocationId,
                            stay.StartedAtUtc,
                            stay.EndedAtUtc,
                            stay.Orientation,
                            stay.Note,
                            stay.IsActive,
                            stay.CreatedAtUtc,
                            stay.UpdatedAtUtc);

                    return Results.Ok(
                        response);
                });

        return endpoints;
    }
}
