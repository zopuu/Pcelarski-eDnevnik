namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class HarvestExposureNormalizer(
    HarvestGroupingPolicy policy,
    HarvestAreaCompatibility areaCompatibility) {
    public IReadOnlyList<EffectiveExposureSegment>
        Normalize(
            IReadOnlyList<RawExposureSegment>
                rawSegments,
            HarvestSourceDataIndex index) {
        if (rawSegments.Count == 0) {
            return [];
        }

        var ordered =
            rawSegments
                .OrderBy(
                    x =>
                        x.Interval
                            .StartedAtUtc)
                .ThenBy(
                    x =>
                        x.Interval
                            .EndedAtUtcExclusive)
                .ThenBy(
                    x =>
                        x.ApiaryStayId)
                .ToList();

        var normalized =
            new List<
                EffectiveExposureSegment>();

        var current =
            new EffectiveExposureSegment(
                [ordered[0]]);

        for (
            var i = 1;
            i < ordered.Count;
            i++) {
            var next =
                ordered[i];

            var contiguous =
                next.Interval.StartedAtUtc <=
                current.Interval
                    .EndedAtUtcExclusive;

            if (
                contiguous
                &&
                areaCompatibility
                    .AreEquivalent(
                        current,
                        next,
                        index)) {
                current =
                    new EffectiveExposureSegment(
                        current.Sources
                            .Concat([next])
                            .ToList());

                continue;
            }

            normalized.Add(current);

            current =
                new EffectiveExposureSegment(
                    [next]);
        }

        normalized.Add(current);

        return TrimShortEdgeSegments(
            normalized);
    }

    private IReadOnlyList<
        EffectiveExposureSegment>
        TrimShortEdgeSegments(
            IReadOnlyList<
                EffectiveExposureSegment>
                segments) {
        if (segments.Count <= 1) {
            return segments;
        }

        var removeFirst =
            segments[0].DurationDays <
            policy.MinimumMeaningfulEdgeStayDays;

        var removeLast =
            segments[^1].DurationDays <
            policy.MinimumMeaningfulEdgeStayDays;

        // Never remove the whole effective history.
        if (
            segments.Count == 2
            &&
            removeFirst
            &&
            removeLast) {
            return segments;
        }

        var startIndex =
            removeFirst
                ? 1
                : 0;

        var endExclusive =
            removeLast
                ? segments.Count - 1
                : segments.Count;

        if (startIndex >= endExclusive) {
            return segments;
        }

        return segments
            .Skip(startIndex)
            .Take(
                endExclusive -
                startIndex)
            .ToList();
    }
}