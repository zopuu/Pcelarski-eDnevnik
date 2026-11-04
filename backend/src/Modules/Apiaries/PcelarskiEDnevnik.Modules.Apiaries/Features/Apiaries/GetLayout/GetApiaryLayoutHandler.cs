using System.Data;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetLayout;

public sealed class GetApiaryLayoutHandler(
    ICurrentBeekeeperContext currentBeekeeper,
    ApiariesDbContext dbContext,
    IApiaryActiveHiveReader activeHiveReader) {
    public async Task<GetApiaryLayoutResponse> HandleAsync(
        Guid apiaryId,
        CancellationToken cancellationToken) {
        var beekeeperId = await currentBeekeeper.GetBeekeeperIdAsync(
            cancellationToken);

        // The Hives reader enlists in this transaction to use the same PostgreSQL snapshot.
        await using var transaction = dbContext.Database.IsRelational()
            ? await dbContext.Database.BeginTransactionAsync(
                IsolationLevel.RepeatableRead,
                cancellationToken)
            : null;

        var ownedApiaryExists = await dbContext.Apiaries
            .AsNoTracking()
            .AnyAsync(apiary =>
                apiary.Id == apiaryId &&
                apiary.OwnerBeekeeperId == beekeeperId &&
                apiary.Status != ApiaryStatus.Inactive,
                cancellationToken);

        if (!ownedApiaryExists) {
            throw new NotFoundException(
                "apiaries.layout_not_found",
                "The apiary layout was not found.");
        }

        var stayId = await dbContext.ApiaryStays
            .AsNoTracking()
            .Where(stay =>
                stay.ApiaryId == apiaryId &&
                stay.EndedAtUtc == null)
            .Select(stay => (Guid?)stay.Id)
            .SingleOrDefaultAsync(cancellationToken);

        if (stayId is null) {
            throw new ConflictException(
                "apiaries.layout_no_active_stay",
                "The apiary has no active stay.");
        }

         var layout = await dbContext.ApiaryLayouts
            .AsNoTracking()
            .Where(candidate => candidate.ApiaryStayId == stayId.Value)
            .Select(candidate => new {
                candidate.Id,
                candidate.ApiaryStayId,
                candidate.Version
            })
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException(
                "An active apiary stay has no layout.");

        var positions = await dbContext.ApiaryLayoutPositions
            .AsNoTracking()
            .Where(position => position.LayoutId == layout.Id)
            .Select(position => new {
                position.HiveId,
                position.X,
                position.Y
            })
            .ToDictionaryAsync(position => position.HiveId, cancellationToken);

        var activeHives = await activeHiveReader.GetActiveHivesAsync(
            beekeeperId,
            apiaryId,
            cancellationToken);

        var hives = activeHives
            .Select(hive => {
                var hasPosition = positions.TryGetValue(hive.Id, out var position);
                return new ApiaryLayoutHiveResponse(
                    hive.Id,
                    hive.Label,
                    hive.ColorHex,
                    hive.HiveType,
                    hasPosition ? position!.X : null,
                    hasPosition ? position!.Y : null);
            })
            .ToArray();

        if (transaction is not null) {
            await transaction.CommitAsync(cancellationToken);
        }

        return new GetApiaryLayoutResponse(
            layout.Id,
            layout.ApiaryStayId,
            layout.Version,
            hives);
    }
}
