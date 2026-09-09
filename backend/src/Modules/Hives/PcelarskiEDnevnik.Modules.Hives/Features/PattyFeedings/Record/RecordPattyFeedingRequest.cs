using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.PattyFeeding;

namespace PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.Record;

public sealed record RecordPattyFeedingRequest
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
            "Patty mass is required.")]
    public int? PattyMassG {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Patty type is required.")]
    [EnumDataType(
        typeof(PattyType),
        ErrorMessage =
            "Invalid patty type.")]
    public PattyType? PattyType {
        get;
        init;
    }

    [StringLength(
        PattyFeedingRules.ManufacturerMaxLength,
        ErrorMessage =
            "Manufacturer cannot exceed 100 characters.")]
    public string? Manufacturer {
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
    public List<RecordPattyFeedingHiveRequest>? Hives {
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

        if (PattyMassG is <= 0) {
            yield return new ValidationResult(
                "Patty mass must be positive.",
                [nameof(PattyMassG)]);
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
                hive.Percentage is null ||
                hive.Percentage <= 0 ||
                hive.Percentage >
                    PattyFeedingRules.MaximumPercentage)) {
            yield return new ValidationResult(
                "Every percentage must be greater than zero and at most 300.",
                [nameof(Hives)]);
        }
    }
}

public sealed record RecordPattyFeedingHiveRequest {
    public Guid HiveId {
        get;
        init;
    }

    public decimal? Percentage {
        get;
        init;
    }
}
