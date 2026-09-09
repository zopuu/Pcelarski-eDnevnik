using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Record;

public sealed record RecordHiveMaintenanceRequest
    : IValidatableObject {
    [Required(
        ErrorMessage =
            "Hive ID is required.")]
    public Guid? HiveId {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Maintenance date is required.")]
    public DateTimeOffset? PerformedAt {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Maintenance type is required.")]
    [EnumDataType(
        typeof(HiveMaintenanceType),
        ErrorMessage =
            "Invalid maintenance type.")]
    public HiveMaintenanceType? MaintenanceType {
        get;
        init;
    }

    public decimal? CostAmount {
        get;
        init;
    }

    public string? CurrencyCode {
        get;
        init;
    }

    public string? ServiceProvider {
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
        if (HiveId == Guid.Empty) {
            yield return new ValidationResult(
                "Hive ID cannot be empty.",
                [nameof(HiveId)]);
        }

        if (PerformedAt ==
            default(DateTimeOffset)) {
            yield return new ValidationResult(
                "Maintenance date is required.",
                [nameof(PerformedAt)]);
        }

        foreach (var validationResult in
            HiveMaintenanceRequestValidation
                .ValidateDetails(
                    CostAmount,
                    CurrencyCode,
                    ServiceProvider,
                    nameof(CostAmount),
                    nameof(CurrencyCode),
                    nameof(ServiceProvider))) {
            yield return validationResult;
        }
    }
}
