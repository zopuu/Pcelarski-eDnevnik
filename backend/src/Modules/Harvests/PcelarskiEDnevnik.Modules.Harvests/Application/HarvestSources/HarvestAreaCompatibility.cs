namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class HarvestAreaCompatibility(
    HarvestGroupingPolicy policy,
    ForageProfileSimilarityCalculator
        forageSimilarity) {
    public bool AreEquivalent(
        RawExposureSegment left,
        RawExposureSegment right,
        HarvestSourceDataIndex index) {
        if (left.LocationId ==
            right.LocationId) {
            return true;
        }

        var distance =
            GeoDistanceCalculator
                .DistanceMeters(
                    left.Location.Latitude,
                    left.Location.Longitude,
                    right.Location.Latitude,
                    right.Location.Longitude);

        if (distance >
            policy
                .NearbyLocationDistanceMeters) {
            return false;
        }

        return forageSimilarity.AreSimilar(
            left,
            right,
            index);
    }

    public bool AreEquivalent(
        EffectiveExposureSegment left,
        RawExposureSegment right,
        HarvestSourceDataIndex index) {
        return left.Sources.All(
            source =>
                AreEquivalent(
                    source,
                    right,
                    index));
    }

    public bool AreEquivalent(
        EffectiveExposureSegment left,
        EffectiveExposureSegment right,
        HarvestSourceDataIndex index) {
        foreach (var leftSource
                 in left.Sources) {
            foreach (var rightSource
                     in right.Sources) {
                if (!AreEquivalent(
                        leftSource,
                        rightSource,
                        index)) {
                    return false;
                }
            }
        }

        return true;
    }
}