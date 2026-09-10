using PcelarskiEDnevnik.Modules.Hives.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class HarvestSourceResolver(
    HarvestExposureNormalizer normalizer) {
    public HarvestSourceResolutionResult
        Resolve(
            HarvestableSuperStaySource
                superStay,
            HarvestSourceDataIndex index) {
        if (
            superStay.EndedOn <
            superStay.StartedOn) {
            return Failure(
                superStay,
                "harvests.invalid_super_stay_period",
                "The super stay has an invalid date range.");
        }

        if (superStay.HiveStays.Count == 0) {
            return Failure(
                superStay,
                "harvests.super_source_has_no_hive_stay",
                "No hive stay history overlaps the super stay.");
        }

        var superInterval =
            UtcInterval.FromSuperStay(
                superStay.StartedOn,
                superStay.EndedOn);

        var rawSegments =
            new List<RawExposureSegment>();

        foreach (
            var hiveStay
            in superStay.HiveStays
                .OrderBy(
                    x =>
                        x.StartedAtUtc)
                .ThenBy(x => x.Id)) {
            var hiveStayEnd =
                hiveStay.EndedAtUtc ??
                superInterval
                    .EndedAtUtcExclusive;

            if (
                hiveStayEnd <=
                hiveStay.StartedAtUtc) {
                continue;
            }

            var hiveInterval =
                new UtcInterval(
                    hiveStay.StartedAtUtc,
                    hiveStayEnd);

            if (!UtcInterval.TryIntersect(
                    superInterval,
                    hiveInterval,
                    out var hiveOverlap)) {
                continue;
            }

            var apiaryStays =
                index.GetApiaryStays(
                    hiveStay.ApiaryId);

            foreach (
                var apiaryStay
                in apiaryStays) {
                var apiaryStayEnd =
                    apiaryStay.EndedAtUtc ??
                    hiveOverlap
                        .EndedAtUtcExclusive;

                if (
                    apiaryStayEnd <=
                    apiaryStay.StartedAtUtc) {
                    continue;
                }

                var apiaryInterval =
                    new UtcInterval(
                        apiaryStay.StartedAtUtc,
                        apiaryStayEnd);

                if (!UtcInterval.TryIntersect(
                        hiveOverlap,
                        apiaryInterval,
                        out var finalOverlap)) {
                    continue;
                }

                if (!index.TryGetLocation(
                        apiaryStay.LocationId,
                        out var location)) {
                    return Failure(
                        superStay,
                        "harvests.super_source_location_missing",
                        "A location referenced by the exposure history could not be resolved.");
                }

                rawSegments.Add(
                    new RawExposureSegment(
                        apiaryStay,
                        location,
                        finalOverlap));
            }
        }

        if (rawSegments.Count == 0) {
            return Failure(
                superStay,
                "harvests.super_source_has_no_apiary_exposure",
                "No apiary stay could be resolved for the super stay.");
        }

        var orderedRaw =
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

        if (HasAmbiguousOverlap(
                orderedRaw)) {
            return Failure(
                superStay,
                "harvests.super_source_history_ambiguous",
                "The resolved stay history contains overlapping incompatible records.");
        }

        if (!HasCalendarCoverage(
                superStay,
                orderedRaw)) {
            return Failure(
                superStay,
                "harvests.super_source_history_incomplete",
                "The stay history does not cover the complete super stay period.");
        }

        var effective =
            normalizer.Normalize(
                orderedRaw,
                index);

        if (effective.Count == 0) {
            return Failure(
                superStay,
                "harvests.super_source_has_no_effective_exposure",
                "No effective exposure remains after normalization.");
        }

        return
            HarvestSourceResolutionResult
                .Success(
                    new ResolvedHarvestSource(
                        superStay,
                        orderedRaw,
                        effective));
    }

    private static bool
        HasAmbiguousOverlap(
            IReadOnlyList<
                RawExposureSegment>
                segments) {
        for (
            var i = 1;
            i < segments.Count;
            i++) {
            var previous =
                segments[i - 1];

            var current =
                segments[i];

            if (
                current.Interval
                    .StartedAtUtc <
                previous.Interval
                    .EndedAtUtcExclusive
                &&
                current.ApiaryStayId !=
                previous.ApiaryStayId) {
                return true;
            }
        }

        return false;
    }

    private static bool
        HasCalendarCoverage(
            HarvestableSuperStaySource
                superStay,
            IReadOnlyList<
                RawExposureSegment>
                segments) {
        var ordered =
            segments
                .OrderBy(x => x.StartedOn)
                .ThenBy(x => x.EndedOn)
                .ToList();

        if (
            ordered[0].StartedOn >
            superStay.StartedOn) {
            return false;
        }

        var coveredThrough =
            ordered[0].EndedOn;

        foreach (
            var segment
            in ordered.Skip(1)) {
            if (
                segment.StartedOn >
                coveredThrough.AddDays(1)) {
                return false;
            }

            if (
                segment.EndedOn >
                coveredThrough) {
                coveredThrough =
                    segment.EndedOn;
            }
        }

        return coveredThrough >=
               superStay.EndedOn;
    }

    private static
        HarvestSourceResolutionResult
        Failure(
            HarvestableSuperStaySource
                superStay,
            string code,
            string message) {
        return
            HarvestSourceResolutionResult
                .Failure(
                    superStay.HiveSuperStayId,
                    code,
                    message);
    }
}