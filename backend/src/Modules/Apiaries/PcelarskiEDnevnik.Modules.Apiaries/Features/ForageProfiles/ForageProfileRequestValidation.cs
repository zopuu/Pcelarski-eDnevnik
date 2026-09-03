using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles;

internal static class ForageProfileRequestValidation {
    public static IEnumerable<ValidationResult> ValidateItems(
        IReadOnlyCollection<ForageProfileItemRequest>? items) {
        if (items is null) {
            yield return new ValidationResult(
                "Items are required.",
                ["Items"]);

            yield break;
        }

        var validForageTypes = new List<ForageType>();
        var totalPercentage = 0m;

        foreach (var (item, index) in items.Select(
                     (item, index) => (item, index))) {
            var prefix = $"Items[{index}]";

            if (item is null) {
                yield return new ValidationResult(
                    "Forage profile item is required.",
                    [prefix]);

                continue;
            }

            if (!item.ForageType.HasValue) {
                yield return new ValidationResult(
                    "Forage type is required.",
                    [$"{prefix}.ForageType"]);
            }
            else if (!Enum.IsDefined(item.ForageType.Value)) {
                yield return new ValidationResult(
                    "Invalid forage type.",
                    [$"{prefix}.ForageType"]);
            }
            else if (item.ForageType.Value == ForageType.Other) {
                yield return new ValidationResult(
                    "Other is created automatically by the server.",
                    [$"{prefix}.ForageType"]);
            }
            else {
                validForageTypes.Add(item.ForageType.Value);
            }

            if (item.Percentage <= 0 ||
                item.Percentage >
                    ForageProfileRules.TotalPercentage) {
                yield return new ValidationResult(
                    "Percentage must be greater than 0 and at most 100.00.",
                    [$"{prefix}.Percentage"]);
            }

            if (!ForageProfileRules.HasAtMostTwoDecimalPlaces(
                    item.Percentage)) {
                yield return new ValidationResult(
                    "Percentage cannot have more than two decimal places.",
                    [$"{prefix}.Percentage"]);
            }

            if (item.Intensity <
                    ForageProfileRules.MinimumIntensity ||
                item.Intensity >
                    ForageProfileRules.MaximumIntensity) {
                yield return new ValidationResult(
                    "Intensity must be between 1 and 5.",
                    [$"{prefix}.Intensity"]);
            }

            if (item.Notes is { Length: > ForageProfileRules.NotesMaxLength }) {
                yield return new ValidationResult(
                    $"Notes cannot exceed {ForageProfileRules.NotesMaxLength} characters.",
                    [$"{prefix}.Notes"]);
            }

            totalPercentage += item.Percentage;
        }

        if (validForageTypes
            .GroupBy(x => x)
            .Any(x => x.Count() > 1)) {
            yield return new ValidationResult(
                "Forage types must be unique within a profile.",
                ["Items"]);
        }

        if (totalPercentage >
            ForageProfileRules.TotalPercentage) {
            yield return new ValidationResult(
                "The total percentage cannot exceed 100.00.",
                ["Items"]);
        }
    }
}
