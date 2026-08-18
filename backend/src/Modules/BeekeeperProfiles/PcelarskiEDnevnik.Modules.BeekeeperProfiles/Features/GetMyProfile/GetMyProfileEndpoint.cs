using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Features.GetMyProfile {
    public static class GetMyProfileEndpoint {
        public static IEndpointRouteBuilder MapGetMyProfileEndpoint(
            this IEndpointRouteBuilder endpoints
            ) {
            endpoints.MapGet(
                "/me",
                async (
                    ICurrentUserContext currentUser,
                    BeekeeperProfilesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                        var profile =
                        await dbContext.BeekeeperProfiles
                            .AsNoTracking()
                            .Where(
                                x =>
                                    x.UserId ==
                                    currentUser.UserId)
                            .Select(
                                x =>
                                    new GetMyProfileResponse(
                                        x.Id,
                                        x.FirstName,
                                        x.LastName,
                                        x.Hid,
                                        x.Phone,
                                        x.AgriculturalHoldingNumber))
                            .SingleOrDefaultAsync(
                                cancellationToken);

                        if (profile is null) {
                            return Results.NotFound();
                        }

                        return Results.Ok(profile);
                    });
            return endpoints;
        }
    }
}
