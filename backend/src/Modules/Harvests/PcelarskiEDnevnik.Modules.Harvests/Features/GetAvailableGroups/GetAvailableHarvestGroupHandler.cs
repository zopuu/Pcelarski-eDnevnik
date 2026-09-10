using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;
using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;
using PcelarskiEDnevnik.Modules.Hives.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.GetAvailableGroups;

internal sealed class
    GetAvailableHarvestGroupsHandler(
        IHarvestableSuperSourceReader
            superSourceReader,
        IApiaryHarvestContextReader
            apiaryContextReader,
        HarvestGroupingPolicy policy,
        HarvestSourceResolver resolver,
        HarvestSourceGrouper grouper) {
    public async Task<
        GetAvailableHarvestGroupsResponse>
        HandleAsync(
            Guid beekeeperId,
            CancellationToken cancellationToken) {
        var candidates =
            await superSourceReader
                .ReadAsync(
                    beekeeperId,
                    cancellationToken);

        if (candidates.Count == 0) {
            return new
                GetAvailableHarvestGroupsResponse(
                    policy.AlgorithmVersion,
                    [],
                    []);
        }

        var apiaryIds =
            candidates
                .SelectMany(
                    x =>
                        x.HiveStays)
                .Select(
                    x =>
                        x.ApiaryId)
                .Distinct()
                .ToArray();

        var startedOn =
            candidates.Min(
                x =>
                    x.StartedOn);

        var endedOn =
            candidates.Max(
                x =>
                    x.EndedOn);

        var apiaryContext =
            await apiaryContextReader
                .ReadAsync(
                    beekeeperId,
                    apiaryIds,
                    startedOn,
                    endedOn,
                    cancellationToken);

        var index =
            new HarvestSourceDataIndex(
                apiaryContext);

        var resolvedSources =
            new List<
                ResolvedHarvestSource>(
                candidates.Count);

        var issues =
            new List<
                HarvestSourceIssueResponse>();

        foreach (var candidate in candidates) {
            var result =
                resolver.Resolve(
                    candidate,
                    index);

            if (result.Source is not null) {
                resolvedSources.Add(
                    result.Source);

                continue;
            }

            if (result.Issue is not null) {
                issues.Add(
                    new HarvestSourceIssueResponse(
                        result.Issue
                            .HiveSuperStayId,
                        result.Issue.Code,
                        result.Issue.Message));
            }
        }

        if (resolvedSources.Count == 0) {
            return new
                GetAvailableHarvestGroupsResponse(
                    policy.AlgorithmVersion,
                    [],
                    issues);
        }

        var groups =
            grouper.Group(
                resolvedSources,
                index);

        var responses =
            groups
                .Select(
                    group =>
                        MapGroup(
                            group,
                            policy))
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

        return new
            GetAvailableHarvestGroupsResponse(
                policy.AlgorithmVersion,
                responses,
                issues);
    }

    private static
        AvailableHarvestGroupResponse
        MapGroup(
            HarvestSourceGroup group,
            HarvestGroupingPolicy policy) {
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
                        x =>
                            x.Sources)
                    .Select(
                        x =>
                            x.Location)
                    .GroupBy(
                        x => x.Id)
                    .Select(
                        x =>
                            x.First())
                    .OrderBy(
                        x =>
                            x.Name)
                    .ThenBy(
                        x =>
                            x.Id)
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
                            x =>
                                x.StartedOn),
                        segments.Max(
                            x =>
                                x.EndedOn),
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
                    policy.AlgorithmVersion,
                    sources.Select(
                        x =>
                            x.SuperStay
                                .HiveSuperStayId)),
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