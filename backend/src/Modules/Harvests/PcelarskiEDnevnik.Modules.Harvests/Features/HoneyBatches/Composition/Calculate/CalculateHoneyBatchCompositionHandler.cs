using Microsoft.EntityFrameworkCore;
using Npgsql;
using PcelarskiEDnevnik.Modules.Harvests.Application.Composition;
using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Harvests.Domain;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;
using PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Calculate;

internal sealed class CalculateHoneyBatchCompositionHandler(
    HarvestsDbContext dbContext,
    HarvestWriteTransaction writeTransaction,
    HarvestSourceSetResolver sourceSetResolver,
    HoneyBatchCompositionCalculator calculator,
    HoneyCompositionPolicy policy,
    TimeProvider timeProvider) {
    public async Task<CalculateHoneyBatchCompositionResult> HandleAsync(
        Guid beekeeperId,
        Guid batchId,
        CancellationToken cancellationToken) {
        try {
            return await writeTransaction.ExecuteAsync(
                beekeeperId,
                ct => ExecuteAsync(beekeeperId, batchId, ct),
                cancellationToken);
        }
        catch (DbUpdateException exception)
            when (IsCalculatedCompositionConflict(exception)) {
            throw new ConflictException(
                "honey_batch_composition.already_determined",
                "A composition has already been determined for this honey batch.",
                exception);
        }
    }

    private async Task<CalculateHoneyBatchCompositionResult> ExecuteAsync(
        Guid beekeeperId,
        Guid batchId,
        CancellationToken cancellationToken) {
        var batch = await dbContext.HoneyBatches.SingleOrDefaultAsync(
            x => x.Id == batchId && x.OwnerBeekeeperId == beekeeperId,
            cancellationToken);

        if (batch is null) {
            return CalculateHoneyBatchCompositionResult.NotFound();
        }

        HoneyBatchCompositionWriter.EnsureFinalized(batch);

        if (await dbContext.HoneyBatchCompositions.AnyAsync(
                x => x.HoneyBatchId == batch.Id,
                cancellationToken)) {
            throw new ConflictException(
                "honey_batch_composition.already_determined",
                "A composition has already been determined for this honey batch.");
        }

        var framesByHiveSuperStayId = await (
            from harvest in dbContext.HoneyHarvests.AsNoTracking()
            join item in dbContext.HoneyHarvestItems.AsNoTracking()
                on harvest.Id equals item.HoneyHarvestId
            where harvest.HoneyBatchId == batch.Id
                  && harvest.BeekeeperId == beekeeperId
            group item by item.HiveSuperStayId into itemGroup
            select new {
                HiveSuperStayId = itemGroup.Key,
                FramesHarvested = itemGroup.Sum(x => x.FramesHarvested)
            })
            .ToDictionaryAsync(
                x => x.HiveSuperStayId,
                x => x.FramesHarvested,
                cancellationToken);

        var sourceSet = await sourceSetResolver.ResolveByIdsAsync(
            beekeeperId,
            framesByHiveSuperStayId.Keys.ToArray(),
            cancellationToken);

        var calculation = calculator.Calculate(sourceSet, framesByHiveSuperStayId);

        if (!calculation.IsSuccess) {
            return CalculateHoneyBatchCompositionResult.CannotCalculate(
                calculation.Issues);
        }

        var composition = HoneyBatchComposition.CreateCalculated(
            batch.Id,
            policy.AlgorithmVersion,
            timeProvider.GetUtcNow());

        var compositionItems = HoneyBatchCompositionItem.CreateValidatedSet(
            composition.Id,
            calculation.Items.Select(
                x => new HoneyBatchCompositionItemInput(
                    x.ForageType,
                    x.Percentage,
                    null)).ToArray());

        dbContext.HoneyBatchCompositions.Add(composition);
        dbContext.HoneyBatchCompositionItems.AddRange(compositionItems);

        return CalculateHoneyBatchCompositionResult.Succeeded(
            HoneyBatchCompositionWriter.ToResponse(composition, compositionItems));
    }

    private static bool IsCalculatedCompositionConflict(
        DbUpdateException exception) {
        return exception.InnerException is PostgresException {
            SqlState: PostgresErrorCodes.UniqueViolation,
            ConstraintName: "ux_honey_batch_compositions_calculated_batch"
        };
    }
}

internal sealed record CalculateHoneyBatchCompositionResult(
    HoneyBatchCompositionResponse? Composition,
    IReadOnlyList<CompositionCalculationIssue> Issues,
    bool WasNotFound) {
    public bool IsUncalculable => Issues.Count > 0;

    public static CalculateHoneyBatchCompositionResult Succeeded(
        HoneyBatchCompositionResponse composition) =>
        new(composition, [], false);

    public static CalculateHoneyBatchCompositionResult CannotCalculate(
        IReadOnlyList<CompositionCalculationIssue> issues) =>
        new(null, issues, false);

    public static CalculateHoneyBatchCompositionResult NotFound() =>
        new(null, [], true);
}
