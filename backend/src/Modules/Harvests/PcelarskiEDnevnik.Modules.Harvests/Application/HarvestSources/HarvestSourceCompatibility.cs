namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class HarvestSourceCompatibility(
    HarvestGroupingPolicy policy,
    HarvestAreaCompatibility areaCompatibility) {
    public bool AreCompatible(
        ResolvedHarvestSource left,
        ResolvedHarvestSource right,
        HarvestSourceDataIndex index) {
        if (!ArePeriodsCompatible(
                left.SuperStay.StartedOn,
                left.SuperStay.EndedOn,
                right.SuperStay.StartedOn,
                right.SuperStay.EndedOn)) {
            return false;
        }

        if (
            left.EffectiveExposureSegments.Count !=
            right.EffectiveExposureSegments.Count) {
            return false;
        }

        for (
            var i = 0;
            i <
            left.EffectiveExposureSegments.Count;
            i++) {
            var leftSegment =
                left.EffectiveExposureSegments[i];

            var rightSegment =
                right.EffectiveExposureSegments[i];

            if (!areaCompatibility
                    .AreEquivalent(
                        leftSegment,
                        rightSegment,
                        index)) {
                return false;
            }

            if (!ArePeriodsCompatible(
                    leftSegment.StartedOn,
                    leftSegment.EndedOn,
                    rightSegment.StartedOn,
                    rightSegment.EndedOn)) {
                return false;
            }
        }

        return true;
    }

    private bool ArePeriodsCompatible(
        DateOnly leftStart,
        DateOnly leftEnd,
        DateOnly rightStart,
        DateOnly rightEnd) {
        var overlaps =
            leftStart <= rightEnd
            &&
            rightStart <= leftEnd;

        if (!overlaps) {
            return false;
        }

        var startDifference =
            Math.Abs(
                leftStart.DayNumber -
                rightStart.DayNumber);

        var endDifference =
            Math.Abs(
                leftEnd.DayNumber -
                rightEnd.DayNumber);

        return
            startDifference <=
            policy.TemporalToleranceDays
            &&
            endDifference <=
            policy.TemporalToleranceDays;
    }
}