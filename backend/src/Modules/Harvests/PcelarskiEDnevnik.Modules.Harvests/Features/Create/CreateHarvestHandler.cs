using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestExecution;
using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Harvests.Domain;
using PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.Create;

internal sealed class CreateHarvestHandler(
    HarvestsDbContext dbContext,
    HarvestAvailabilityService
        availabilityService,
    HarvestFrameAllocator frameAllocator,
    HoneyBatchMatcher batchMatcher,
    HarvestFrameInventory frameInventory,
    HarvestWriteTransaction writeTransaction) {
    public Task<CreateHarvestResponse>
        HandleAsync(
            Guid beekeeperId,
            CreateHarvestRequest request,
            CancellationToken cancellationToken) {
        return writeTransaction.ExecuteAsync(
            beekeeperId,
            ct =>
                ExecuteAsync(
                    beekeeperId,
                    request,
                    ct),
            cancellationToken);
    }

    private async Task<CreateHarvestResponse>
        ExecuteAsync(
            Guid beekeeperId,
            CreateHarvestRequest request,
            CancellationToken cancellationToken) {
        var availability =
            await availabilityService.GetAsync(
                beekeeperId,
                cancellationToken);

        var group =
            availability.Groups
                .SingleOrDefault(
                    x =>
                        HarvestGroupKeyBuilder.Build(
                            availability
                                .AlgorithmVersion,
                            x)
                        ==
                        request.GroupKey);

        if (group is null) {
            throw new ConflictException(
                "harvests.source_group_changed",
                "Harvest availability changed. Refresh the available harvest groups and try again.");
        }

        var allocations =
            frameAllocator.Allocate(
                group,
                request.SelectedFrameCount);

        var harvestedOn =
            request.HarvestedOn!.Value;

        var latestSourceEnd =
            allocations.Max(
                x =>
                    x.Source
                        .SuperStay
                        .EndedOn);

        if (harvestedOn <
            latestSourceEnd) {
            throw new ConflictException(
                "harvests.harvest_date_before_source_ready",
                "Harvest date cannot be before the selected supers were removed from their hives.");
        }

        var selectedSources =
            allocations
                .Select(x => x.Source)
                .ToList();

        var sourceIds =
            selectedSources
                .Select(
                    x =>
                        x.SuperStay
                            .HiveSuperStayId)
                .Distinct()
                .ToArray();

        var sourcePeriodStartedOn =
            selectedSources.Min(
                x =>
                    x.SuperStay
                        .StartedOn);

        var sourcePeriodEndedOn =
            selectedSources.Max(
                x =>
                    x.SuperStay
                        .EndedOn);

        var batch =
            await batchMatcher
                .FindCompatibleOpenBatchAsync(
                    beekeeperId,
                    sourceIds,
                    HoneyUnits.Kilogram,
                    cancellationToken);

        var createdNewBatch =
            batch is null;

        if (batch is null) {
            var identity =
                HoneyBatchIdentityGenerator
                    .Generate(
                        harvestedOn);

            batch =
                HoneyBatch.Create(
                    beekeeperId,
                    identity.Name,
                    identity.BatchCode,
                    request.HoneyAmount,
                    HoneyUnits.Kilogram,
                    sourcePeriodStartedOn,
                    sourcePeriodEndedOn);

            dbContext.HoneyBatches.Add(
                batch);
        }
        else {
            batch.RegisterAdditionalHarvest(
                request.HoneyAmount,
                HoneyUnits.Kilogram,
                sourcePeriodStartedOn,
                sourcePeriodEndedOn);
        }

        /*
         * Lock and consume frame inventory only after
         * all source/batch validation has succeeded.
         *
         * These updates participate in the same
         * PostgreSQL transaction.
         */
        await frameInventory.ConsumeAsync(
            allocations,
            cancellationToken);

        var harvest =
            HoneyHarvest.Create(
                beekeeperId,
                batch.Id,
                harvestedOn,
                request.HoneyAmount,
                HoneyUnits.Kilogram,
                request.Notes);

        dbContext.HoneyHarvests.Add(
            harvest);

        foreach (var allocation in allocations) {
            var item =
                HoneyHarvestItem.Create(
                    harvest.Id,
                    allocation
                        .HiveSuperStayId,
                    allocation
                        .FramesHarvested);

            dbContext.HoneyHarvestItems.Add(
                item);
        }

        var groupRemainingFrames =
            group.Sources.Sum(
                x =>
                    x.SuperStay
                        .RemainingHarvestableFrameCount)
            -
            request.SelectedFrameCount;

        var sources =
            allocations
                .Select(
                    x =>
                        new HarvestedSuperResponse(
                            x.HiveSuperStayId,
                            x.Source
                                .SuperStay
                                .HiveSuperId,
                            x.Source
                                .SuperStay
                                .HiveId,
                            x.Source
                                .SuperStay
                                .HiveLabel,
                            x.FramesHarvested))
                .ToList();

        return new CreateHarvestResponse(
            harvest.Id,
            batch.Id,
            batch.BatchCode,
            createdNewBatch,
            harvestedOn,
            request.SelectedFrameCount,
            request.HoneyAmount,
            HoneyUnits.Kilogram,
            batch.TotalAmount,
            batch.PeriodStartedOn,
            batch.PeriodEndedOn,
            groupRemainingFrames,
            sources);
    }
}