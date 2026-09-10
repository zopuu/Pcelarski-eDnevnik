namespace PcelarskiEDnevnik.Modules.Harvests.Features.Create;

public sealed record CreateHarvestResponse(
    Guid HarvestId,
    Guid HoneyBatchId,
    string BatchCode,
    bool CreatedNewBatch,
    DateOnly HarvestedOn,
    int HarvestedFrameCount,
    decimal HoneyAmount,
    string Unit,
    decimal BatchTotalAmount,
    DateOnly BatchPeriodStartedOn,
    DateOnly BatchPeriodEndedOn,
    int RemainingFramesInSourceGroup,
    IReadOnlyList<
        HarvestedSuperResponse>
        Sources);

public sealed record HarvestedSuperResponse(
    Guid HiveSuperStayId,
    Guid HiveSuperId,
    Guid HiveId,
    string HiveLabel,
    int FramesHarvested);