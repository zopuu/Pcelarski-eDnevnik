using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.Delete;

public static class DeleteForageProfileEndpoint {
    public static IEndpointRouteBuilder MapDeleteForageProfileEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapDelete(
            "/{forageProfileId:guid}",
            async (
                Guid apiaryId,
                Guid forageProfileId,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(cancellationToken);

                    var profile =
                        await (
                            from forageProfile in dbContext.ForageProfiles

                            join stay in dbContext.ApiaryStays
                                on forageProfile.ApiaryStayId equals stay.Id

                            join apiary in dbContext.Apiaries
                                on stay.ApiaryId equals apiary.Id

                            where
                                forageProfile.Id == forageProfileId &&
                                stay.ApiaryId == apiaryId &&
                                stay.EndedAtUtc == null &&
                                apiary.OwnerBeekeeperId == beekeeperId

                            select forageProfile
                        )
                        .SingleOrDefaultAsync(cancellationToken);

                    if (profile is null) {
                        return Results.NotFound();
                    }

                    dbContext.ForageProfiles.Remove(profile);

                    await dbContext.SaveChangesAsync(cancellationToken);

                    return Results.NoContent();
                });

        return endpoints;
    }
}
