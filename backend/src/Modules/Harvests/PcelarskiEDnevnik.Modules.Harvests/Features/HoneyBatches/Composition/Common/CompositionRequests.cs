using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Harvests.Domain;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Composition.Common;

public sealed record CompositionItemRequest {
    [Required]
    [StringLength(HoneyHarvestRules.ForageTypeMaxLength)]
    public string ForageType { get; init; } = null!;

    [Range(
        HoneyHarvestRules.MinimumPercentage,
        HoneyHarvestRules.MaximumPercentage)]
    public int Percentage { get; init; }

    [StringLength(HoneyHarvestRules.NotesMaxLength)]
    public string? Notes { get; init; }
}

public sealed record ManualHoneyBatchCompositionRequest {
    [Required]
    [MinLength(1)]
    public IReadOnlyCollection<CompositionItemRequest>? Items { get; init; }
}

public sealed record LaboratoryHoneyBatchCompositionRequest {
    [Required]
    [StringLength(HoneyHarvestRules.EvidenceReferenceMaxLength)]
    public string EvidenceReference { get; init; } = null!;

    [Required]
    [MinLength(1)]
    public IReadOnlyCollection<CompositionItemRequest>? Items { get; init; }
}

internal static class CompositionRequestValidation {
    public static Dictionary<string, string[]>? ValidateItems(
        IReadOnlyCollection<CompositionItemRequest>? items) {
        if (items is null || items.Count == 0) {
            return new Dictionary<string, string[]> {
                ["items"] = ["At least one composition item is required."]
            };
        }

        if (items.Sum(x => x.Percentage) != 100) {
            return new Dictionary<string, string[]> {
                ["items"] = ["Composition percentages must total exactly 100."]
            };
        }

        if (items
            .Select(x => x.ForageType?.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count() != items.Count) {
            return new Dictionary<string, string[]> {
                ["items"] = ["Forage types must be unique."]
            };
        }

        return null;
    }

    public static IReadOnlyCollection<HoneyBatchCompositionItemInput>
        ToInputs(IReadOnlyCollection<CompositionItemRequest> items) {
        return items.Select(
            x => new HoneyBatchCompositionItemInput(
                x.ForageType,
                x.Percentage,
                x.Notes)).ToArray();
    }
}
