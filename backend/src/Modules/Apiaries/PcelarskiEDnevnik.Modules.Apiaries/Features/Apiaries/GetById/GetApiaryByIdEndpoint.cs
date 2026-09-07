using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetById;

public static class GetApiaryByIdEndpoint {
    public static IEndpointRouteBuilder MapGetApiaryByIdEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/{id:guid}",
            async (
                Guid id,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var apiary =
                        await dbContext.Apiaries
                            .AsNoTracking()
                            .Where(
                                x =>
                                    x.Id == id &&
                                    x.OwnerBeekeeperId == beekeeperId)
                            .Select(
                                x => new GetApiaryByIdResponse(
                                    x.Id,
                                    x.IdentificationNumber,
                                    x.Name,
                                    x.ImagePath == null
                                        ? null
                                        : "/uploads/" + x.ImagePath,
                                    x.Type,
                                    x.Status,
                                    x.CreatedAtUtc,
                                    x.UpdatedAtUtc))
                            .SingleOrDefaultAsync(
                                cancellationToken);

                    if (apiary is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(apiary);
                });

        return endpoints;
    }
}
