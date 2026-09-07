using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Delete;

public static class DeleteApiaryStayEndpoint {
    public static IEndpointRouteBuilder MapDeleteApiaryStayEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapDelete(
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
                        await dbContext.ApiaryStays
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == stayId &&
                                    x.ApiaryId == apiaryId,
                                cancellationToken);

                    if (stay is null) {
                        return Results.NotFound();
                    }

                    dbContext.ApiaryStays.Remove(stay);

                    await dbContext.SaveChangesAsync(
                        cancellationToken);

                    return Results.NoContent();
                });

        return endpoints;
    }
}
