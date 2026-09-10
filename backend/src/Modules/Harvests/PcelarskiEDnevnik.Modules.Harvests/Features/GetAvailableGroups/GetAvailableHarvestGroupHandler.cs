using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetAvailableGroups;

internal sealed class
    GetAvailableHarvestGroupsHandler(
        HarvestAvailabilityService
            availabilityService) {
    public async Task<
        GetAvailableHarvestGroupsResponse>
        HandleAsync(
            Guid beekeeperId,
            CancellationToken cancellationToken) {
        var snapshot =
            await availabilityService.GetAsync(
                beekeeperId,
                cancellationToken);

        var responses =
            snapshot.Groups
                .Select(
                    group =>
                        MapGroup(
                            group,
                            snapshot
                                .AlgorithmVersion))
                .OrderByDescending(
                    x =>
                        x.PeriodEndedOn)
                .ThenByDescending(
                    x =>
                        x.PeriodStartedOn)
                .ThenBy(
                    x =>
                        x.GroupKey)
                .ToList();

        var issues =
            snapshot.Issues
                .Select(
                    x =>
                        new HarvestSourceIssueResponse(
                            x.HiveSuperStayId,
                            x.Code,
                            x.Message))
                .ToList();

        return new
            GetAvailableHarvestGroupsResponse(
                snapshot.AlgorithmVersion,
                responses,
                issues);
    }

    private static
        AvailableHarvestGroupResponse
        MapGroup(
            HarvestSourceGroup group,
            string algorithmVersion) {
        var sources =
            group.Sources;

        var segmentCount =
            sources[0]
                .EffectiveExposureSegments
                .Count;

        var exposurePath =
            new List<
                HarvestGroupExposureSegmentResponse>(
                segmentCount);

        for (
            var index = 0;
            index < segmentCount;
            index++) {
            var segments =
                sources
                    .Select(
                        x =>
                            x.EffectiveExposureSegments[
                                index])
                    .ToList();

            var locations =
                segments
                    .SelectMany(
                        x => x.Sources)
                    .Select(
                        x => x.Location)
                    .GroupBy(
                        x => x.Id)
                    .Select(
                        x => x.First())
                    .OrderBy(
                        x => x.Name)
                    .ThenBy(
                        x => x.Id)
                    .Select(
                        x =>
                            new
                                HarvestExposureLocationResponse(
                                    x.Id,
                                    x.Name,
                                    x.Latitude,
                                    x.Longitude))
                    .ToList();

            exposurePath.Add(
                new
                    HarvestGroupExposureSegmentResponse(
                        index,
                        segments.Min(
                            x => x.StartedOn),
                        segments.Max(
                            x => x.EndedOn),
                        segments.Min(
                            x =>
                                x.DurationDays),
                        segments.Max(
                            x =>
                                x.DurationDays),
                        locations));
        }

        var supers =
            sources
                .OrderBy(
                    x =>
                        x.SuperStay
                            .HiveLabel)
                .ThenBy(
                    x =>
                        x.SuperStay
                            .HiveSuperStayId)
                .Select(
                    x =>
                        new HarvestableSuperResponse(
                            x.SuperStay
                                .HiveSuperStayId,
                            x.SuperStay
                                .HiveSuperId,
                            x.SuperStay
                                .HiveId,
                            x.SuperStay
                                .HiveLabel,
                            x.SuperStay
                                .StartedOn,
                            x.SuperStay
                                .EndedOn,
                            x.SuperStay
                                .HarvestableFrameCount,
                            x.SuperStay
                                .RemainingHarvestableFrameCount))
                .ToList();

        return new
            AvailableHarvestGroupResponse(
                HarvestGroupKeyBuilder.Build(
                    algorithmVersion,
                    group),
                sources.Min(
                    x =>
                        x.SuperStay
                            .StartedOn),
                sources.Max(
                    x =>
                        x.SuperStay
                            .EndedOn),
                sources.Sum(
                    x =>
                        x.SuperStay
                            .RemainingHarvestableFrameCount),
                sources.Count,
                exposurePath,
                supers);
    }
}