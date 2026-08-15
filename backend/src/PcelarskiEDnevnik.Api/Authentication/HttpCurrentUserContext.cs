using OpenIddict.Abstractions;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Api.Authentication;

internal sealed class HttpCurrentUserContext(
    IHttpContextAccessor httpContextAccessor)
    : ICurrentUserContext {
    public bool IsAuthenticated =>
        httpContextAccessor
            .HttpContext?
            .User
            .Identity?
            .IsAuthenticated == true;

    public Guid UserId {
        get {
            var principal =
                httpContextAccessor
                    .HttpContext?
                    .User;

            var subject =
                principal?.GetClaim(
                    OpenIddictConstants.Claims.Subject);

            if (!Guid.TryParse(
                    subject,
                    out var userId)) {
                throw new InvalidOperationException(
                    "The authenticated user does not " +
                    "contain a valid subject claim.");
            }

            return userId;
        }
    }
}