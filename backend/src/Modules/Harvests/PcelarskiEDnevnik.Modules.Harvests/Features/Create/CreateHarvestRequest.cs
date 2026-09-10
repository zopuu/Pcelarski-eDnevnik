using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Harvests.Domain;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.Create;

public sealed record CreateHarvestRequest {
    [Required]
    [StringLength(64)]
    public string GroupKey {
        get;
        init;
    } = null!;

    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "Selected frame count must be greater than zero.")]
    public int SelectedFrameCount {
        get;
        init;
    }

    [Required]
    public DateOnly? HarvestedOn {
        get;
        init;
    }

    [Range(
        typeof(decimal),
        "0.001",
        "999999999.999",
        ErrorMessage =
            "Honey amount must be greater than zero.")]
    public decimal HoneyAmount {
        get;
        init;
    }

    [StringLength(
        HoneyHarvestRules.NotesMaxLength)]
    public string? Notes {
        get;
        init;
    }
}