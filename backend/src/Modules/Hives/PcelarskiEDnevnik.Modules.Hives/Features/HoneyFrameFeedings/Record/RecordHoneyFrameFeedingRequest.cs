using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings.Record;

public sealed record RecordHoneyFrameFeedingRequest
    : IValidatableObject {
    [Required(
        ErrorMessage =
            "Feeding date is required.")]
    public DateTimeOffset? PerformedAt {
        get;
        init;
    }

    [StringLength(
        HoneyFrameFeedingRules.FrameSourceMaxLength,
        ErrorMessage =
            "Frame source cannot exceed the allowed length.")]
    public string? FrameSource {
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
    public List<RecordHoneyFrameFeedingHiveRequest>? Hives {
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
                hive.FrameCount is null ||
                hive.FrameCount <= 0 ||
                hive.FrameCount >
                    HoneyFrameFeedingRules
                        .MaximumFrameCount)) {
            yield return new ValidationResult(
                $"Every frame count must be between 1 and {HoneyFrameFeedingRules.MaximumFrameCount}.",
                [nameof(Hives)]);
        }
    }
}

public sealed record RecordHoneyFrameFeedingHiveRequest {
    public Guid HiveId {
        get;
        init;
    }

    public int? FrameCount {
        get;
        init;
    }
}
