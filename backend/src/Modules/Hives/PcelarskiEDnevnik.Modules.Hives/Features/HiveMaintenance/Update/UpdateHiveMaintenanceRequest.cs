using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Update;

public sealed record UpdateHiveMaintenanceRequest
    : IValidatableObject {
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

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
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
