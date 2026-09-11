using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Harvests.Domain;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;
using PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;

internal sealed class HoneyBatchCompositionWriter(
    HarvestsDbContext dbContext,
    HarvestWriteTransaction writeTransaction,
    TimeProvider timeProvider) {
    public Task<HoneyBatchCompositionResponse?> WriteManualAsync(
        Guid beekeeperId,
        Guid batchId,
        IReadOnlyCollection<HoneyBatchCompositionItemInput> items,
        CancellationToken cancellationToken) {
        return writeTransaction.ExecuteAsync(
            beekeeperId,
            ct => WriteAsync(
                beekeeperId,
                batchId,
                items,
                evidenceReference: null,
                ct),
            cancellationToken);
    }

    public Task<HoneyBatchCompositionResponse?> WriteLaboratoryAsync(
        Guid beekeeperId,
        Guid batchId,
        string evidenceReference,
        IReadOnlyCollection<HoneyBatchCompositionItemInput> items,
        CancellationToken cancellationToken) {
        return writeTransaction.ExecuteAsync(
            beekeeperId,
            ct => WriteAsync(
                beekeeperId,
                batchId,
                items,
                evidenceReference,
                ct),
            cancellationToken);
    }

    private async Task<HoneyBatchCompositionResponse?> WriteAsync(
        Guid beekeeperId,
        Guid batchId,
        IReadOnlyCollection<HoneyBatchCompositionItemInput> items,
        string? evidenceReference,
        CancellationToken cancellationToken) {
        var batch = await dbContext.HoneyBatches.SingleOrDefaultAsync(
            x => x.Id == batchId && x.OwnerBeekeeperId == beekeeperId,
            cancellationToken);

        if (batch is null) {
            return null;
        }

        EnsureFinalized(batch);

        var determinedAt = timeProvider.GetUtcNow();
        var composition = evidenceReference is null
            ? HoneyBatchComposition.CreateManual(batch.Id, determinedAt)
            : HoneyBatchComposition.CreateLaboratory(
                batch.Id,
                determinedAt,
                evidenceReference);

        var compositionItems = HoneyBatchCompositionItem.CreateValidatedSet(
            composition.Id,
            items);

        dbContext.HoneyBatchCompositions.Add(composition);
        dbContext.HoneyBatchCompositionItems.AddRange(compositionItems);

        return ToResponse(composition, compositionItems);
    }

    internal static void EnsureFinalized(HoneyBatch batch) {
        if (batch.Status != HoneyBatchStatus.Finalized) {
            throw new ConflictException(
                "honey_batch_composition.batch_not_finalized",
                "Honey batch composition can only be determined after the batch is finalized.");
        }
    }

    internal static HoneyBatchCompositionResponse ToResponse(
        HoneyBatchComposition composition,
        IReadOnlyList<HoneyBatchCompositionItem> items) {
        return new HoneyBatchCompositionResponse(
            composition.Id,
            composition.AlgorithmVersion,
            composition.DeterminedAt,
            composition.DeterminationMethod.ToString(),
            composition.EvidenceReference,
            items.OrderByDescending(x => x.Percentage)
                .ThenBy(x => x.ForageType, StringComparer.OrdinalIgnoreCase)
                .ThenBy(x => x.ForageType, StringComparer.Ordinal)
                .Select(x => new HoneyBatchCompositionItemResponse(
                    x.Id,
                    x.ForageType,
                    x.Percentage,
                    x.Notes))
                .ToList());
    }
}
