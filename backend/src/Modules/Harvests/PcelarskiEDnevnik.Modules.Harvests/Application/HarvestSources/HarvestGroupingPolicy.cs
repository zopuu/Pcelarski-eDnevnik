using Microsoft.Extensions.Options;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class HarvestGroupingPolicy {
    public HarvestGroupingPolicy(
        IOptionsSnapshot<HarvestGroupingOptions>
            options) {
        var value =
            options.Value;

        AlgorithmVersion =
            value.AlgorithmVersion;

        TemporalToleranceDays =
            value.TemporalToleranceDays;

        NearbyLocationDistanceMeters =
            value.NearbyLocationDistanceMeters;

        ForageProfileOverlapThresholdPercent =
            value
                .ForageProfileOverlapThresholdPercent;

        MinimumMeaningfulEdgeStayDays =
            value.MinimumMeaningfulEdgeStayDays;
    }

    public string AlgorithmVersion {
        get;
    }

    public int TemporalToleranceDays {
        get;
    }

    public double NearbyLocationDistanceMeters {
        get;
    }

    public decimal
        ForageProfileOverlapThresholdPercent {
        get;
    }

    public int MinimumMeaningfulEdgeStayDays {
        get;
    }
}