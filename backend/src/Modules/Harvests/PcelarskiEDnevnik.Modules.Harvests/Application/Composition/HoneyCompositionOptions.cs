using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.Composition;

public sealed class HoneyCompositionOptions {
    public const string SectionName =
        "Harvests:Composition";

    [Required]
    [StringLength(20)]
    public string AlgorithmVersion {
        get;
        init;
    } = null!;
}
