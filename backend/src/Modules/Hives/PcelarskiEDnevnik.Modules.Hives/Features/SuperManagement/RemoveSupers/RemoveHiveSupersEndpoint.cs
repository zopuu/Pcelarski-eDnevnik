using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

using SuperManagementAction =
    PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement.SuperManagement;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.RemoveSupers;

public static class RemoveHiveSupersEndpoint {
    public static RouteGroupBuilder MapRemoveHiveSupersEndpoint(
        this RouteGroupBuilder group) {
        group.MapPost(
                "/{hiveId:guid}/supers/remove",
                HandleAsync)
            .WithName("RemoveHiveSupers")
            .Produces<RemoveHiveSupersResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound)
            .Produces(
                StatusCodes.Status409Conflict);

        return group;
    }

    private static async Task<IResult> HandleAsync(
        Guid hiveId,
        RemoveHiveSupersRequest request,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var hiveExists =
            await dbContext.Hives
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.Id == hiveId &&
                        x.OwnerBeekeeperId ==
                            beekeeperId,
                    cancellationToken);

        if (!hiveExists) {
            return Results.NotFound();
        }

        var validationErrors =
            ValidateRequest(request);

        if (validationErrors.Count > 0) {
            return Results.ValidationProblem(
                validationErrors);
        }

        var requestedIds =
            request.Items
                .Select(x => x.HiveSuperId)
                .ToArray();

        /*
         * Duplicate IDs in one operation are invalid.
         */
        if (requestedIds.Distinct().Count() !=
            requestedIds.Length) {
            return Results.ValidationProblem(
                new Dictionary<string, string[]> {
                    ["items"] =
                    [
                        "The same hive super cannot be selected more than once."
                    ]
                });
        }

        var hiveSupers =
            await dbContext.HiveSupers
                .Where(
                    x =>
                        requestedIds.Contains(x.Id) &&
                        x.OwnerBeekeeperId ==
                            beekeeperId)
                .ToListAsync(
                    cancellationToken);

        if (hiveSupers.Count != requestedIds.Length) {
            return Results.NotFound();
        }

        var activeStays =
            await dbContext.HiveSuperStays
                .Where(
                    x =>
                        requestedIds.Contains(
                            x.HiveSuperId) &&
                        x.HiveId == hiveId &&
                        x.EndedOn == null)
                .ToListAsync(
                    cancellationToken);

        if (activeStays.Count != requestedIds.Length) {
            throw new ConflictException(
                "hives.super_not_on_hive",
                "One or more selected supers are not currently on this hive.");
        }

        var supersById =
            hiveSupers.ToDictionary(
                x => x.Id);

        var staysBySuperId =
            activeStays.ToDictionary(
                x => x.HiveSuperId);
        var persistedValidationErrors =
            ValidateAgainstCurrentState(
                request,
                supersById);

        if (persistedValidationErrors.Count > 0) {
            return Results.ValidationProblem(
                persistedValidationErrors);
        }

        var performedAt =
            DateTimeOffset.UtcNow;

        var endedOn =
            DateOnly.FromDateTime(
                performedAt.UtcDateTime);

        var management =
            SuperManagementAction.Create(
                hiveId: hiveId,
                performedAt: performedAt,
                performedByBeekeeperId:
                    beekeeperId,
                actionGroupId: null,
                imageUrl: null,
                notes: null);

        var managementItems =
            new List<SuperManagementItem>(
                request.Items.Count);

        foreach (var requestedItem in request.Items) {
            var hiveSuper =
                supersById[
                    requestedItem.HiveSuperId];

            var stay =
                staysBySuperId[
                    requestedItem.HiveSuperId];

            switch (requestedItem.Operation) {
                case SuperManagementOperation.RemoveForHarvest: {
                        /*
                         * Request validation guarantees
                         * this has a value.
                         */
                        var harvestableFrameCount =
                            requestedItem
                                .HarvestableFrameCount!
                                .Value;

                        stay.EndForHarvest(
                            endedOn,
                            harvestableFrameCount);

                        hiveSuper.RemoveForHarvest();

                        break;
                    }

                case SuperManagementOperation.RemoveAndArchive: {
                        stay.EndAndArchive(
                            endedOn);

                        hiveSuper.ArchiveWithoutHarvest();

                        break;
                    }

                default: {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                ["items"] =
                                [
                                    "Only RemoveForHarvest and RemoveAndArchive operations are allowed."
                                ]
                            });
                    }
            }

            var managementItem =
                SuperManagementItem.Create(
                    superManagementId:
                        management.Id,
                    hiveSuperId:
                        hiveSuper.Id,
                    operation:
                        requestedItem.Operation);

            managementItems.Add(
                managementItem);
        }

        dbContext.SuperManagements.Add(
            management);

        dbContext.SuperManagementItems.AddRange(
            managementItems);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        var response =
            new RemoveHiveSupersResponse(
                management.Id,
                hiveId,
                request.Items
                    .Select(
                        requestedItem => {
                            var hiveSuper =
                                supersById[
                                    requestedItem
                                        .HiveSuperId];

                            var stay =
                                staysBySuperId[
                                    requestedItem
                                        .HiveSuperId];

                            return new RemovedHiveSuperResponse(
                                hiveSuper.Id,
                                stay.Id,
                                requestedItem.Operation,
                                hiveSuper.Status,
                                stay.HarvestableFrameCount);
                        })
                    .ToList());

        return Results.Created(
            $"/api/hives/{hiveId}/actions/{management.Id}",
            response);
    }

    private static Dictionary<string, string[]>
        ValidateRequest(
            RemoveHiveSupersRequest request) {
        var errors =
            new Dictionary<string, string[]>();

        for (var index = 0;
             index < request.Items.Count;
             index++) {
            var item =
                request.Items[index];

            var itemErrors =
                new List<string>();

            if (item.HiveSuperId == Guid.Empty) {
                itemErrors.Add(
                    "Hive super id cannot be empty.");
            }

            switch (item.Operation) {
                case SuperManagementOperation.RemoveForHarvest: {
                        if (!item.HarvestableFrameCount.HasValue) {
                            itemErrors.Add(
                                "Harvestable frame count is required when removing a super for harvest.");
                        }
                        else if (
                            item.HarvestableFrameCount.Value <= 0) {
                            itemErrors.Add(
                                "Harvestable frame count must be greater than zero.");
                        }

                        break;
                    }

                case SuperManagementOperation.RemoveAndArchive: {
                        if (item.HarvestableFrameCount.HasValue) {
                            itemErrors.Add(
                                "Harvestable frame count must not be supplied when archiving a super without harvest.");
                        }

                        break;
                    }

                default: {
                        itemErrors.Add(
                            "Operation must be RemoveForHarvest or RemoveAndArchive.");

                        break;
                    }
            }

            if (itemErrors.Count > 0) {
                errors[
                        $"items[{index}]"] =
                    itemErrors.ToArray();
            }
        }

        return errors;
    }

    private static Dictionary<string, string[]>
        ValidateAgainstCurrentState(
            RemoveHiveSupersRequest request,
            IReadOnlyDictionary<Guid, HiveSuper>
                supersById) {
        var errors =
            new Dictionary<string, string[]>();

        for (var index = 0;
             index < request.Items.Count;
             index++) {
            var requestedItem =
                request.Items[index];

            var hiveSuper =
                supersById[
                    requestedItem.HiveSuperId];

            var itemErrors =
                new List<string>();

            if (hiveSuper.Status !=
                HiveSuperStatus.OnHive) {
                itemErrors.Add(
                    "The selected super is not currently on a hive.");
            }

            if (
                requestedItem.Operation ==
                    SuperManagementOperation.RemoveForHarvest &&
                requestedItem.HarvestableFrameCount.HasValue &&
                requestedItem.HarvestableFrameCount.Value >
                    hiveSuper.FrameCount) {
                itemErrors.Add(
                    $"Harvestable frame count cannot exceed the super frame count ({hiveSuper.FrameCount}).");
            }

            if (itemErrors.Count > 0) {
                errors[
                        $"items[{index}]"] =
                    itemErrors.ToArray();
            }
        }

        return errors;
    }
}