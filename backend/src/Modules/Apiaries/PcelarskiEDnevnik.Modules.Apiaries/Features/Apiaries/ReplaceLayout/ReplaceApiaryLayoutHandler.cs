using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Domain.LayoutGeometry;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.ReplaceLayout;

public sealed class ReplaceApiaryLayoutHandler(
    ICurrentBeekeeperContext currentBeekeeper,
    ApiariesDbContext dbContext,
    IApiaryActiveHiveReader activeHiveReader) {
    public async Task<ReplaceApiaryLayoutResponse> HandleAsync(
        Guid apiaryId,
        ReplaceApiaryLayoutRequest request,
        CancellationToken cancellationToken) {
        var desired = ValidateRequest(request);
        var beekeeperId = await currentBeekeeper.GetBeekeeperIdAsync(
            cancellationToken);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            cancellationToken);

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

        // Lock order: active stay, then its layout. Selected-hive relocation
        // follows the same order for both affected apiaries.
        // A concurrent stay closure waits here; the active predicate is rechecked.
        var stay = await ApiaryLayoutLocks.LockActiveStayAsync(
            dbContext, apiaryId, cancellationToken);

        if (stay is null) {
            if (request.ExpectedApiaryStayId is Guid expectedStayId &&
                await dbContext.ApiaryStays.AsNoTracking().AnyAsync(candidate =>
                    candidate.Id == expectedStayId &&
                    candidate.ApiaryId == apiaryId &&
                    candidate.EndedAtUtc != null,
                    cancellationToken)) {
                throw new ConflictException(
                    "apiaries.layout_read_only",
                    "The apiary stay is completed and its layout is read-only.");
            }

            throw new ConflictException(
                "apiaries.layout_no_active_stay",
                "The apiary has no active stay.");
        }

        if (stay.Id != request.ExpectedApiaryStayId) {
            if (await dbContext.ApiaryStays.AsNoTracking().AnyAsync(candidate =>
                    candidate.Id == request.ExpectedApiaryStayId &&
                    candidate.ApiaryId == apiaryId &&
                    candidate.EndedAtUtc != null,
                    cancellationToken)) {
                throw new ConflictException(
                    "apiaries.layout_read_only",
                    "The apiary stay is completed and its layout is read-only.");
            }

            throw new ConflictException(
                "apiaries.layout_version_conflict",
                "The active apiary stay has changed.");
        }

        var layout = await ApiaryLayoutLocks.LockLayoutForStayAsync(
            dbContext, stay.Id, cancellationToken)
            ?? throw new InvalidOperationException(
                "An active apiary stay has no layout.");

        if (layout.Version != request.ExpectedVersion) {
            throw new ConflictException(
                "apiaries.layout_version_conflict",
                "The apiary layout has changed.");
        }

        // The Hives reader enlists in the same physical connection and transaction.
        var activeHives = await activeHiveReader.GetActiveHivesAsync(
            beekeeperId,
            apiaryId,
            cancellationToken);
        var activeById = activeHives.ToDictionary(hive => hive.Id);

        if (desired.Any(position => !activeById.ContainsKey(position.HiveId))) {
            throw new ConflictException(
                "apiaries.layout_hive_not_in_apiary",
                "A positioned hive is not active in this apiary.");
        }

        var geometry = ApiaryLayoutGeometryValidator.Validate(
            desired.Select(position => new ApiaryLayoutHivePlacement(
                position.HiveId,
                position.X,
                position.Y,
                HiveFootprintCatalog.Resolve(activeById[position.HiveId].HiveType))));

        if (geometry.InvalidCoordinates.Count > 0) {
            throw new BadRequestException(
                "apiaries.layout_invalid_position",
                "A layout position has invalid coordinates.");
        }

        if (geometry.DuplicateHiveIds.Count > 0) {
            throw new BadRequestException(
                "apiaries.layout_duplicate_hive",
                "A hive appears more than once in the layout.");
        }

        if (geometry.Collisions.Count > 0) {
            throw new BadRequestException(
                "apiaries.layout_collision",
                "Layout positions overlap or are too close.",
                geometry.Collisions);
        }

        await dbContext.Entry(layout)
            .Collection(candidate => candidate.Positions)
            .LoadAsync(cancellationToken);

        layout.ReplacePositions(desired);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new ReplaceApiaryLayoutResponse(
            layout.Id,
            layout.ApiaryStayId,
            layout.Version,
            layout.Positions
                .OrderBy(position => position.HiveId)
                .Select(position => new ReplaceApiaryLayoutPositionResponse(
                    position.HiveId,
                    position.X,
                    position.Y))
                .ToArray());
    }

    private static IReadOnlyCollection<(Guid HiveId, int X, int Y)> ValidateRequest(
        ReplaceApiaryLayoutRequest request) {
        if (request.ExpectedApiaryStayId is null ||
            request.ExpectedApiaryStayId == Guid.Empty ||
            request.ExpectedVersion is null or < 1 ||
            request.Positions is null) {
            throw new BadRequestException(
                "apiaries.layout_invalid_position",
                "The layout request is invalid.");
        }

        var positions = new List<(Guid HiveId, int X, int Y)>();
        foreach (var position in request.Positions) {
            if (position is null || position.HiveId is null ||
                position.HiveId == Guid.Empty ||
                position.X is null || position.Y is null) {
                throw new BadRequestException(
                    "apiaries.layout_invalid_position",
                    "A layout position is invalid.");
            }

            positions.Add((position.HiveId.Value, position.X.Value, position.Y.Value));
        }

        return positions;
    }
}
