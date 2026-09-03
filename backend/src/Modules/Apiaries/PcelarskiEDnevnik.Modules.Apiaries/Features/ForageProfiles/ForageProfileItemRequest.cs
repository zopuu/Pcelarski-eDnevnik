using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles;

public sealed record ForageProfileItemRequest {
    [Required]
    [EnumDataType(
        typeof(ForageType),
        ErrorMessage = "Invalid forage type.")]
    public ForageType? ForageType { get; init; }

    [Range(
        typeof(decimal),
        ForageProfileRules.MinimumPercentageText,
        ForageProfileRules.TotalPercentageText)]
    public decimal Percentage { get; init; }

    [Range(
        ForageProfileRules.MinimumIntensity,
        ForageProfileRules.MaximumIntensity)]
    public short Intensity { get; init; }

    [StringLength(ForageProfileRules.NotesMaxLength)]
    public string? Notes { get; init; }
}
