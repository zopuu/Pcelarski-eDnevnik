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

    [Required(
        ErrorMessage =
            "At least one hive must be selected.")]
    public List<RecordHiveInsulationHiveRequest>? Hives {
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

        if (Hives is null ||
            Hives.Count == 0) {
            yield return new ValidationResult(
                "At least one hive must be selected.",
                [nameof(Hives)]);

            yield break;
        }

        if (Hives.Any(
                hive =>
                    hive is null ||
                    hive.HiveId == Guid.Empty)) {
            yield return new ValidationResult(
                "Hive IDs cannot be empty.",
                [nameof(Hives)]);
        }

        if (Hives.OfType<
                    RecordHiveInsulationHiveRequest>()
                .Select(
                    hive =>
                        hive.HiveId)
                .ToHashSet()
                .Count !=
            Hives.Count) {
            yield return new ValidationResult(
                "Hive IDs must be unique.",
                [nameof(Hives)]);
        }

        foreach (var hive in Hives.OfType<
                     RecordHiveInsulationHiveRequest>()) {
            if (!hive.Paper &&
                !hive.Eps &&
                !hive.Xps) {
                yield return new ValidationResult(
                    "At least one insulation type must be selected for each hive.",
                    [nameof(Hives)]);
            }
        }
    }
}

public sealed record RecordHiveInsulationHiveRequest {
    public Guid HiveId {
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
}
