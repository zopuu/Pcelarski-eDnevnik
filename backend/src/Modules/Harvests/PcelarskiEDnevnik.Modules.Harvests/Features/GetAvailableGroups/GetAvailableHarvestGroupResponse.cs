namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetAvailableGroups;

public sealed record
    GetAvailableHarvestGroupsResponse(
        string AlgorithmVersion,
        IReadOnlyList<
            AvailableHarvestGroupResponse>
            Groups,
        IReadOnlyList<
            HarvestSourceIssueResponse>
            Issues);

public sealed record
    AvailableHarvestGroupResponse(
        string GroupKey,
        DateOnly PeriodStartedOn,
        DateOnly PeriodEndedOn,
        int TotalRemainingFrameCount,
        int SuperCount,
        IReadOnlyList<
            HarvestGroupExposureSegmentResponse>
            ExposurePath,
        IReadOnlyList<
            HarvestableSuperResponse>
            Supers);

public sealed record
    HarvestableSuperResponse(
        Guid HiveSuperStayId,
        Guid HiveSuperId,
        Guid HiveId,
        string HiveLabel,
        DateOnly StartedOn,
        DateOnly EndedOn,
        int HarvestableFrameCount,
        int RemainingHarvestableFrameCount);

public sealed record
    HarvestGroupExposureSegmentResponse(
        int Order,
        DateOnly PeriodStartedOn,
        DateOnly PeriodEndedOn,
        int MinimumDurationDays,
        int MaximumDurationDays,
        IReadOnlyList<
            HarvestExposureLocationResponse>
            Locations);

public sealed record
    HarvestExposureLocationResponse(
        Guid LocationId,
        string? Name,
        decimal Latitude,
        decimal Longitude);

public sealed record
    HarvestSourceIssueResponse(
        Guid HiveSuperStayId,
        string Code,
        string Message);