using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Manual;

internal sealed class ManualHoneyBatchCompositionHandler(
    HoneyBatchCompositionWriter writer) {
    public Task<HoneyBatchCompositionResponse?> HandleAsync(
        Guid beekeeperId,
        Guid batchId,
        ManualHoneyBatchCompositionRequest request,
        CancellationToken cancellationToken) {
        return writer.WriteManualAsync(
            beekeeperId,
            batchId,
            CompositionRequestValidation.ToInputs(request.Items!),
            cancellationToken);
    }
}
