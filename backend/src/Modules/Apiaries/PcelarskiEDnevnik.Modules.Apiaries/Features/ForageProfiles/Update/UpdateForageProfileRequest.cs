using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.Update;

public sealed record UpdateForageProfileRequest
    : IValidatableObject {
    [Required]
    [Range(1, int.MaxValue)]
    public int? Year { get; init; }

    [Range(
        ForageProfileRules.MinimumRadiusKm,
        ForageProfileRules.MaximumRadiusKm)]
    public short? RadiusKm { get; init; }

    [Required]
    [StringLength(ForageProfileRules.NameMaxLength)]
    public string? Name { get; init; }

    [StringLength(ForageProfileRules.NotesMaxLength)]
    public string? Notes { get; init; }

    [Required]
    public IReadOnlyCollection<ForageProfileItemRequest>? Items { get; init; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
        if (string.IsNullOrWhiteSpace(Name)) {
            yield return new ValidationResult(
                "Name is required.",
                [nameof(Name)]);
        }

        foreach (var validationResult in
                 ForageProfileRequestValidation.ValidateItems(Items)) {
            yield return validationResult;
        }
    }
}
