using PcelarskiEDnevnik.Modules.Harvests.Features.Common;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetAll;

public sealed record GetHarvestsResponse(
    PagedResponse<HarvestListItemResponse>
        Page);

public sealed record HarvestListItemResponse(
    Guid Id,
    DateOnly HarvestedOn,
    decimal HoneyAmount,
    string Unit,
    int HarvestedFrameCount,
    int SuperCount,
    Guid HoneyBatchId,
    string BatchCode,
    string BatchName);