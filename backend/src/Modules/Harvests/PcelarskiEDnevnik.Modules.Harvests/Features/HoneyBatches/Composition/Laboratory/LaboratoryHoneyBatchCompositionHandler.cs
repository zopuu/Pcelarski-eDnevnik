using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Laboratory;

internal sealed class LaboratoryHoneyBatchCompositionHandler(
    HoneyBatchCompositionWriter writer) {
    public Task<HoneyBatchCompositionResponse?> HandleAsync(
        Guid beekeeperId,
        Guid batchId,
        LaboratoryHoneyBatchCompositionRequest request,
        CancellationToken cancellationToken) {
        return writer.WriteLaboratoryAsync(
            beekeeperId,
            batchId,
            request.EvidenceReference,
            CompositionRequestValidation.ToInputs(request.Items!),
            cancellationToken);
    }
}
