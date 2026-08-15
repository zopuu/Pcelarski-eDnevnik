using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetAll;

public static class GetApiariesEndpoint {
    public static IEndpointRouteBuilder MapGetApiariesEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
                "/api/apiaries",
                async (
                    ICurrentBeekeeperContext currentBeekeeper,
                    ApiariesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                        var beekeeperId =
                            await currentBeekeeper.GetBeekeeperIdAsync(
                                cancellationToken);

                        var apiaries =
                            await dbContext.Apiaries
                                .AsNoTracking()
                                .Where(
                                    x => x.OwnerBeekeeperId == beekeeperId)
                                .OrderByDescending(
                                    x => x.CreatedAtUtc)
                                .Select(
                                    x => new ApiaryListItemResponse(
                                        x.Id,
                                        x.IdentificationNumber,
                                        x.Name,
                                        x.Type,
                                        x.Status,
                                        x.CreatedAtUtc))
                                .ToListAsync(
                                    cancellationToken);

                        return Results.Ok(apiaries);
                    })
            .RequireAuthorization();

        return endpoints;
    }
}