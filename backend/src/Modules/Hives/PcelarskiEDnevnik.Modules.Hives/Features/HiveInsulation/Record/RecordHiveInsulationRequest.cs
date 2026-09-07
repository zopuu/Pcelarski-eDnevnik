using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.Record;

public sealed record RecordHiveInsulationRequest
    : IValidatableObject {
    [Required(
        ErrorMessage =
            "Insulation date is required.")]
    public DateTimeOffset? PerformedAt {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Insulation operation is required.")]
    [EnumDataType(
        typeof(HiveInsulationOperation),
        ErrorMessage =
            "Invalid insulation operation.")]
    public HiveInsulationOperation? Operation {
        get;
        init;
    }

    public bool Paper {
        get;
        init;
    }

    public bool Eps {
        get;
        init;
    }

    public bool Xps {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "At least one hive must be selected.")]
    public List<Guid>? HiveIds {
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

    [StringLength(
        HiveActionRules.NotesMaxLength,
        ErrorMessage =
            "Notes cannot exceed 1000 characters.")]
    public string? Notes {
        get;
        init;
    }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
        if (PerformedAt ==
            default(DateTimeOffset)) {
            yield return new ValidationResult(
                "Insulation date is required.",
                [nameof(PerformedAt)]);
        }

        if (!Paper &&
            !Eps &&
            !Xps) {
            yield return new ValidationResult(
                "At least one insulation type must be selected.",
                [
                    nameof(Paper),
                    nameof(Eps),
                    nameof(Xps)
                ]);
        }

        if (HiveIds is null ||
            HiveIds.Count == 0) {
            yield return new ValidationResult(
                "At least one hive must be selected.",
                [nameof(HiveIds)]);
        }

        if (HiveIds is not null &&
            HiveIds.Any(
                hiveId =>
                    hiveId == Guid.Empty)) {
            yield return new ValidationResult(
                "Hive IDs cannot be empty.",
                [nameof(HiveIds)]);
        }

        if (HiveIds is not null &&
            HiveIds.ToHashSet().Count !=
            HiveIds.Count) {
            yield return new ValidationResult(
                "Hive IDs must be unique.",
                [nameof(HiveIds)]);
        }
    }
}
