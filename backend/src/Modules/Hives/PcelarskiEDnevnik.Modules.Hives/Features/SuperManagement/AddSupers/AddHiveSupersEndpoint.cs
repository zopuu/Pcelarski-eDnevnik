using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.AddSupers;

public static class AddHiveSupersEndpoint {
    public static RouteGroupBuilder MapAddHiveSupersEndpoint(
        this RouteGroupBuilder group) {
        group.MapPost(
                "/{hiveId:guid}/supers",
                HandleAsync)
            .WithName("AddHiveSupers")
            .Produces<AddHiveSupersResponse>(
                StatusCodes.Status201Created)
            .Produces(
                StatusCodes.Status404NotFound)
            .ProducesValidationProblem();

        return group;
    }

    private static async Task<IResult> HandleAsync(
        Guid hiveId,
        AddHiveSupersRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var hive =
            await dbContext.Hives
                .SingleOrDefaultAsync(
                    x =>
                        x.Id == hiveId &&
                        x.OwnerBeekeeperId == beekeeperId,
                    cancellationToken);

        if (hive is null) {
            return Results.NotFound();
        }

        var performedAt =
            DateTimeOffset.UtcNow;

        var startedOn =
            DateOnly.FromDateTime(
                performedAt.UtcDateTime);

        /*
         * One SuperManagement represents the complete
         * beekeeper operation, regardless of how many
         * supers are added.
         */
        var management =
            Domain.HiveActions.SuperManagement.SuperManagement.Create(
                hiveId: hive.Id,
                performedAt: performedAt,
                performedByBeekeeperId: beekeeperId,
                actionGroupId: null,
                imageUrl: null,
                notes: null);

        var hiveSupers =
            new List<HiveSuper>(
                request.Supers.Count);

        var hiveSuperStays =
            new List<HiveSuperStay>(
                request.Supers.Count);

        var managementItems =
            new List<SuperManagementItem>(
                request.Supers.Count);

        foreach (var requestedSuper in request.Supers) {
            /*
             * Hive type comes from the hive.
             *
             * HiveSuper.Create() should also set:
             *
             * Status = HiveSuperStatus.OnHive
             */
            var hiveSuper =
                HiveSuper.Create(
                    ownerBeekeeperId: beekeeperId,
                    type: hive.Type,
                    frameCount: requestedSuper.FrameCount,
                    colorHex: requestedSuper.ColorHex);

            var stay =
                HiveSuperStay.Create(
                    hiveId: hive.Id,
                    hiveSuperId: hiveSuper.Id,
                    startedOn: startedOn);

            var managementItem =
                SuperManagementItem.Create(
                    superManagementId:
                        management.Id,
                    hiveSuperId:
                        hiveSuper.Id,
                    operation:
                        SuperManagementOperation.AddToHive);

            hiveSupers.Add(
                hiveSuper);

            hiveSuperStays.Add(
                stay);

            managementItems.Add(
                managementItem);
        }

        dbContext.SuperManagements.Add(
            management);

        dbContext.HiveSupers.AddRange(
            hiveSupers);

        dbContext.HiveSuperStays.AddRange(
            hiveSuperStays);

        dbContext.SuperManagementItems.AddRange(
            managementItems);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        var response =
            new AddHiveSupersResponse(
                management.Id,
                hive.Id,
                hiveSupers.Count,
                hiveSupers
                    .Zip(
                        hiveSuperStays,
                        (super, stay) =>
                            new AddedHiveSuperResponse(
                                super.Id,
                                stay.Id,
                                super.Type,
                                super.Status,
                                super.FrameCount,
                                super.ColorHex!))
                    .ToList());

        return Results.Created(
            $"/api/hives/{hive.Id}/supers",
            response);
    }
}
