using PcelarskiEDnevnik.Modules.Harvests
    .Application.HarvestSources;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.Common;

internal static class HarvestSourceDetailsMapper {
    public static HarvestSourceDetailsResponse Map(
        Guid hiveSuperStayId,
        int framesHarvested,
        IReadOnlyDictionary<
            Guid,
            ResolvedHarvestSource>
            resolvedSources) {
        if (!resolvedSources.TryGetValue(
                hiveSuperStayId,
                out var source)) {
            return new HarvestSourceDetailsResponse(
                hiveSuperStayId,
                HiveSuperId: null,
                HiveId: null,
                HiveLabel: null,
                SuperStayStartedOn: null,
                SuperStayEndedOn: null,
                framesHarvested,
                []);
        }

        var exposureSegments =
            source.RawExposureSegments
                .OrderBy(
                    x =>
                        x.Interval
                            .StartedAtUtc)
                .ThenBy(
                    x =>
                        x.Interval
                            .EndedAtUtcExclusive)
                .Select(
                    x =>
                        new
                            HarvestSourceExposureSegmentResponse(
                                x.ApiaryStayId,
                                x.ApiaryId,
                                x.LocationId,
                                x.Location.Name,
                                x.Location.Latitude,
                                x.Location.Longitude,
                                x.StartedOn,
                                x.EndedOn,
                                x.DurationDays))
                .ToList();

        return new HarvestSourceDetailsResponse(
            source.SuperStay.HiveSuperStayId,
            source.SuperStay.HiveSuperId,
            source.SuperStay.HiveId,
            source.SuperStay.HiveLabel,
            source.SuperStay.StartedOn,
            source.SuperStay.EndedOn,
            framesHarvested,
            exposureSegments);
    }

    public static IReadOnlyList<
        HarvestSourceResolutionIssueResponse>
        MapIssues(
            IEnumerable<
                HarvestSourceResolutionIssue>
                issues) {
        return issues
            .Select(
                x =>
                    new
                        HarvestSourceResolutionIssueResponse(
                            x.HiveSuperStayId,
                            x.Code,
                            x.Message))
            .ToList();
    }
}