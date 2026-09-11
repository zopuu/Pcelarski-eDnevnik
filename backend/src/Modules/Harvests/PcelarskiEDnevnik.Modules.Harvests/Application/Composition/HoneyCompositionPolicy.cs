using Microsoft.Extensions.Options;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.Composition;

internal sealed class HoneyCompositionPolicy {
    public HoneyCompositionPolicy(
        IOptionsSnapshot<HoneyCompositionOptions>
            options) {
        AlgorithmVersion = options.Value.AlgorithmVersion;
    }

    public string AlgorithmVersion {
        get;
    }
}
