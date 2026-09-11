namespace PcelarskiEDnevnik.Modules.Harvests.Features.Common;

public sealed record HarvestSourceDetailsResponse(
    Guid HiveSuperStayId,
    Guid? HiveSuperId,
    Guid? HiveId,
    string? HiveLabel,
    DateOnly? SuperStayStartedOn,
    DateOnly? SuperStayEndedOn,
    int FramesHarvested,
    IReadOnlyList<
        HarvestSourceExposureSegmentResponse>
        ExposureSegments);

public sealed record HarvestSourceExposureSegmentResponse(
    Guid ApiaryStayId,
    Guid ApiaryId,
    Guid LocationId,
    string? LocationName,
    decimal Latitude,
    decimal Longitude,
    DateOnly StartedOn,
    DateOnly EndedOn,
    int DurationDays);

public sealed record HarvestSourceResolutionIssueResponse(
    Guid HiveSuperStayId,
    string Code,
    string Message);