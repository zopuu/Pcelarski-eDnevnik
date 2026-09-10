using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class
    ForageProfileSimilarityCalculator(
        HarvestGroupingPolicy policy) {
    public bool AreSimilar(
        RawExposureSegment left,
        RawExposureSegment right,
        HarvestSourceDataIndex index) {
        var years =
            GetCoveredYears(left)
                .Intersect(
                    GetCoveredYears(right))
                .OrderBy(x => x)
                .ToArray();

        if (years.Length == 0) {
            return false;
        }

        foreach (var year in years) {
            if (!index.TryGetForageProfile(
                    left.ApiaryStayId,
                    year,
                    out var leftProfile)) {
                return false;
            }

            if (!index.TryGetForageProfile(
                    right.ApiaryStayId,
                    year,
                    out var rightProfile)) {
                return false;
            }

            var overlap =
                CalculateOverlapPercent(
                    leftProfile,
                    rightProfile);

            if (overlap <
                policy
                    .ForageProfileOverlapThresholdPercent) {
                return false;
            }
        }

        return true;
    }

    private static decimal
        CalculateOverlapPercent(
            ForageProfileHarvestSource left,
            ForageProfileHarvestSource right) {
        var leftItems =
            left.Items
                .GroupBy(
                    x => x.ForageType,
                    StringComparer.OrdinalIgnoreCase)
                .ToDictionary(
                    x => x.Key,
                    x =>
                        x.Sum(
                            item =>
                                item.Percentage),
                    StringComparer.OrdinalIgnoreCase);

        var rightItems =
            right.Items
                .GroupBy(
                    x => x.ForageType,
                    StringComparer.OrdinalIgnoreCase)
                .ToDictionary(
                    x => x.Key,
                    x =>
                        x.Sum(
                            item =>
                                item.Percentage),
                    StringComparer.OrdinalIgnoreCase);

        var allTypes =
            leftItems.Keys
                .Concat(
                    rightItems.Keys)
                .Distinct(
                    StringComparer.OrdinalIgnoreCase);

        decimal overlap = 0;

        foreach (var forageType in allTypes) {
            var leftPercentage =
                leftItems.GetValueOrDefault(
                    forageType,
                    0m);

            var rightPercentage =
                rightItems.GetValueOrDefault(
                    forageType,
                    0m);

            overlap +=
                Math.Min(
                    leftPercentage,
                    rightPercentage);
        }

        return overlap;
    }

    private static IEnumerable<int>
        GetCoveredYears(
            RawExposureSegment segment) {
        for (
            var year =
                segment.StartedOn.Year;
            year <=
            segment.EndedOn.Year;
            year++) {
            yield return year;
        }
    }
}