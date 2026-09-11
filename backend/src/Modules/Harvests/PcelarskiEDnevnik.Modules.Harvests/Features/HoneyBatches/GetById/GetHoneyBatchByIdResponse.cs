using PcelarskiEDnevnik.Modules.Harvests
    .Features.Common;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;

public sealed record GetHoneyBatchByIdResponse(
    Guid Id,
    string Name,
    string BatchCode,
    string Status,
    decimal TotalAmount,
    string Unit,
    string? Notes,
    DateOnly PeriodStartedOn,
    DateOnly PeriodEndedOn,
    int HarvestCount,
    int TotalHarvestedFrameCount,
    int SourceSuperCount,
    IReadOnlyList<
        HoneyBatchHarvestResponse>
        Harvests,
    IReadOnlyList<
        HarvestSourceDetailsResponse>
        Sources,
    HoneyBatchCompositionResponse?
        CurrentComposition,
    bool CanCalculateComposition,
    bool CanManuallyDetermineComposition,
    bool CanLaboratoryDetermineComposition,
    IReadOnlyList<
        HarvestSourceResolutionIssueResponse>
        SourceIssues);

public sealed record HoneyBatchHarvestResponse(
    Guid Id,
    DateOnly HarvestedOn,
    decimal HoneyAmount,
    string Unit,
    int HarvestedFrameCount,
    int SuperCount);

public sealed record HoneyBatchCompositionResponse(
    Guid Id,
    string? AlgorithmVersion,
    DateTimeOffset DeterminedAt,
    string DeterminationMethod,
    string? EvidenceReference,
    IReadOnlyList<
        HoneyBatchCompositionItemResponse>
        Items);

public sealed record HoneyBatchCompositionItemResponse(
    Guid Id,
    string ForageType,
    int Percentage,
    string? Notes);
