using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;

using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Features.GetMyProfile;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Features {
    public static class ProfileEndpoints {
        public static IEndpointRouteBuilder MapProfileEndpoints(
            this IEndpointRouteBuilder endpoints
            ) {
            var group =
                endpoints
                    .MapGroup("/api/profile")
                    .WithTags("Profile")
                    .RequireAuthorization();

            group.MapGetMyProfileEndpoint();
            return endpoints;
        }
    }
}
