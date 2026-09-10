using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

public sealed class HarvestGroupingOptions {
    public const string SectionName =
        "Harvests:Grouping";

    public string AlgorithmVersion {
        get;
        init;
    } = null!;

    public int TemporalToleranceDays {
        get;
        init;
    }

    public double NearbyLocationDistanceMeters {
        get;
        init;
    }

    public decimal ForageProfileOverlapThresholdPercent {
        get;
        init;
    }

    public int MinimumMeaningfulEdgeStayDays {
        get;
        init;
    }
}