using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetById;

public sealed record GetHarvestByIdResponse(
    Guid Id,
    DateOnly HarvestedOn,
    decimal HoneyAmount,
    string Unit,
    string? Notes,
    int HarvestedFrameCount,
    int SuperCount,
    DateOnly? SourcePeriodStartedOn,
    DateOnly? SourcePeriodEndedOn,
    HarvestBatchSummaryResponse Batch,
    IReadOnlyList<
        HarvestSourceDetailsResponse>
        Sources,
    IReadOnlyList<
        HarvestSourceResolutionIssueResponse>
        SourceIssues);

public sealed record HarvestBatchSummaryResponse(
    Guid Id,
    string BatchCode,
    string Name,
    string Status);