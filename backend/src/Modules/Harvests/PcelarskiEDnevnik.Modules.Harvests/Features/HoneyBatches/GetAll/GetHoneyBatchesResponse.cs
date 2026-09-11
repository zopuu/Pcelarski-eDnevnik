using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetAll;

public sealed record GetHoneyBatchesResponse(
    PagedResponse<HoneyBatchListItemResponse>
        Page);

public sealed record HoneyBatchListItemResponse(
    Guid Id,
    string Name,
    string BatchCode,
    string Status,
    decimal TotalAmount,
    string Unit,
    DateOnly PeriodStartedOn,
    DateOnly PeriodEndedOn,
    DateOnly? LastHarvestedOn,
    int HarvestCount,
    int TotalHarvestedFrameCount,
    bool HasComposition);