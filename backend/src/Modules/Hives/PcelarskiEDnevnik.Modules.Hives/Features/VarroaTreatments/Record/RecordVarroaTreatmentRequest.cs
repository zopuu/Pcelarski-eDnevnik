using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.Record;

public sealed record RecordVarroaTreatmentRequest
    : IValidatableObject {
    [Required(
        ErrorMessage =
            "Treatment date is required.")]
    public DateTimeOffset? PerformedAt {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Product name is required.")]
    public string? ProductName {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Application method is required.")]
    [EnumDataType(
        typeof(VarroaApplicationMethod),
        ErrorMessage =
            "Invalid application method.")]
    public VarroaApplicationMethod? ApplicationMethod {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Dose amount is required.")]
    public decimal? DoseAmount {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Dose unit is required.")]
    [EnumDataType(
        typeof(VarroaDoseUnit),
        ErrorMessage =
            "Invalid dose unit.")]
    public VarroaDoseUnit? DoseUnit {
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

    [Required(
        ErrorMessage =
            "At least one hive must be selected.")]
    public List<Guid>? HiveIds {
        get;
        init;
    }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
        if (PerformedAt ==
            default(DateTimeOffset)) {
            yield return new ValidationResult(
                "Treatment date is required.",
                [nameof(PerformedAt)]);
        }

        if (!string.IsNullOrWhiteSpace(
                ProductName) &&
            ProductName.Trim().Length >
                VarroaTreatmentRules
                    .ProductNameMaxLength) {
            yield return new ValidationResult(
                "Product name cannot exceed 50 characters.",
                [nameof(ProductName)]);
        }

        if (DoseAmount is <= 0) {
            yield return new ValidationResult(
                "Dose amount must be positive.",
                [nameof(DoseAmount)]);
        }

        if (HiveIds is null ||
            HiveIds.Count == 0) {
            yield return new ValidationResult(
                "At least one hive must be selected.",
                [nameof(HiveIds)]);

            yield break;
        }

        if (HiveIds.Any(
            hiveId =>
                hiveId == Guid.Empty)) {
            yield return new ValidationResult(
                "Hive IDs cannot be empty.",
                [nameof(HiveIds)]);
        }

        if (HiveIds.ToHashSet().Count !=
            HiveIds.Count) {
            yield return new ValidationResult(
                "Hive IDs must be unique.",
                [nameof(HiveIds)]);
        }
    }
}
