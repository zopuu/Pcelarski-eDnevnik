using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SyrupFeeding;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.Record;

public sealed record RecordSyrupFeedingRequest
    : IValidatableObject {
    [Required(
        ErrorMessage =
            "Feeding date is required.")]
    public DateTimeOffset? PerformedAt {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Sugar parts are required.")]
    public decimal? SugarParts {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Water parts are required.")]
    public decimal? WaterParts {
        get;
        init;
    }

    [StringLength(
        SyrupFeedingRules.AdditivesMaxLength,
        ErrorMessage =
            "Additives cannot exceed 500 characters.")]
    public string? Additives {
        get;
        init;
    }

    [StringLength(
        HiveActionRules.NotesMaxLength,
        ErrorMessage =
            "Notes cannot exceed 1000 characters.")]
    public string? Notes {
        get;
        init;
    }

    [StringLength(
        HiveActionRules.ImageUrlMaxLength,
        ErrorMessage =
            "Image URL cannot exceed 255 characters.")]
    public string? ImageUrl {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "At least one hive must be selected.")]
    public List<RecordSyrupFeedingHiveRequest>? Hives {
        get;
        init;
    }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
        if (PerformedAt ==
            default(DateTimeOffset)) {
            yield return new ValidationResult(
                "Feeding date is required.",
                [nameof(PerformedAt)]);
        }

        if (SugarParts is <= 0) {
            yield return new ValidationResult(
                "Sugar parts must be positive.",
                [nameof(SugarParts)]);
        }

        if (WaterParts is <= 0) {
            yield return new ValidationResult(
                "Water parts must be positive.",
                [nameof(WaterParts)]);
        }

        if (Hives is null ||
            Hives.Count == 0) {
            yield return new ValidationResult(
                "At least one hive must be selected.",
                [nameof(Hives)]);

            yield break;
        }

        if (Hives.Any(
            hive =>
                hive.HiveId == Guid.Empty)) {
            yield return new ValidationResult(
                "Hive IDs cannot be empty.",
                [nameof(Hives)]);
        }

        if (Hives
                .Select(
                    hive => hive.HiveId)
                .ToHashSet()
                .Count != Hives.Count) {
            yield return new ValidationResult(
                "Hive IDs must be unique.",
                [nameof(Hives)]);
        }

        if (Hives.Any(
            hive =>
                hive.FillPercentage is null ||
                hive.FillPercentage <= 0 ||
                hive.FillPercentage > 100)) {
            yield return new ValidationResult(
                "Every fill percentage must be greater than zero and at most 100.",
                [nameof(Hives)]);
        }
    }
}

public sealed record RecordSyrupFeedingHiveRequest {
    public Guid HiveId {
        get;
        init;
    }

    public decimal? FillPercentage {
        get;
        init;
    }
}
