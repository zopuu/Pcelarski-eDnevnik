using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Authentication;

internal sealed class CurrentBeekeeperContext(
    ICurrentUserContext currentUserContext,
    BeekeeperProfilesDbContext dbContext)
    : ICurrentBeekeeperContext {
    private Guid? _beekeeperId;

    public async Task<Guid> GetBeekeeperIdAsync(
        CancellationToken cancellationToken = default) {
        if (_beekeeperId.HasValue) {
            return _beekeeperId.Value;
        }

        if (!currentUserContext.IsAuthenticated) {
            throw new UnauthorizedAccessException(
                "The current user is not authenticated.");
        }

        var beekeeperId = await dbContext
            .Set<BeekeeperProfile>()
            .Where(x => x.UserId == currentUserContext.UserId)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(cancellationToken);

        if (!beekeeperId.HasValue) {
            throw new InvalidOperationException(
                "The authenticated user does not have a beekeeper profile.");
        }

        _beekeeperId = beekeeperId.Value;

        return beekeeperId.Value;
    }
}