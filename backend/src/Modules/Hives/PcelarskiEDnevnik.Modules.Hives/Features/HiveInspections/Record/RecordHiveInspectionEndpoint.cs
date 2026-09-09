using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInspections.Record;

public static class RecordHiveInspectionEndpoint {
    public static RouteGroupBuilder MapRecordHiveInspectionEndpoint(
        this RouteGroupBuilder group) {
        group.MapPost(
                "/{hiveId:guid}/inspections",
                HandleAsync)
            .WithName("RecordHiveInspection")
            .Produces<RecordHiveInspectionResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        Guid hiveId,
        RecordHiveInspectionRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper.GetBeekeeperIdAsync(
                cancellationToken);

        var ownedHiveId =
            await dbContext.Hives
                .AsNoTracking()
                .Where(
                    hive =>
                        hive.Id == hiveId &&
                        hive.OwnerBeekeeperId == beekeeperId)
                .Select(hive => (Guid?)hive.Id)
                .SingleOrDefaultAsync(cancellationToken);

        if (ownedHiveId is null) {
            return Results.NotFound();
        }

        var inspection =
            HiveInspection.Create(
                ownedHiveId.Value,
                request.PerformedAt!.Value,
                beekeeperId,
                request.ImageUrl,
                request.Notes,
                request.ToDetails());

        dbContext.HiveInspections.Add(inspection);

        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.Created(
            $"/api/hives/{inspection.HiveId}/inspections/{inspection.Id}",
            new RecordHiveInspectionResponse(
                inspection.Id,
                inspection.HiveId,
                inspection.PerformedAt,
                inspection.InspectionType));
    }
}
