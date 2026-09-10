using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestExecution;

internal sealed record HarvestFrameAllocation(
    ResolvedHarvestSource Source,
    int FramesHarvested) {
    public Guid HiveSuperStayId =>
        Source.SuperStay.HiveSuperStayId;

    public int ExpectedRemainingFrameCount =>
        Source.SuperStay
            .RemainingHarvestableFrameCount;
}