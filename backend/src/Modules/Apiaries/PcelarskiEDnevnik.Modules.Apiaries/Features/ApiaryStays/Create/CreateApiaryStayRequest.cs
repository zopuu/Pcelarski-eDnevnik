using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Create;

public sealed record CreateApiaryStayRequest
    : IValidatableObject {
    [Required]
    public Guid? LocationId { get; init; }

    [Required]
    public DateTimeOffset? StartedAtUtc { get; init; }

    public DateTimeOffset? EndedAtUtc { get; init; }

    [EnumDataType(
        typeof(HiveEntranceOrientation),
        ErrorMessage =
            "Invalid hive entrance orientation.")]
    public HiveEntranceOrientation? Orientation { get; init; }

    [StringLength(ApiaryStayRules.NoteMaxLength)]
    public string? Note { get; init; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
        if (LocationId.HasValue &&
            LocationId.Value == Guid.Empty) {
            yield return new ValidationResult(
                "Location ID cannot be empty.",
                [nameof(LocationId)]);
        }

        if (StartedAtUtc.HasValue &&
            EndedAtUtc.HasValue &&
            EndedAtUtc.Value <= StartedAtUtc.Value) {
            yield return new ValidationResult(
                "End date must be after start date.",
                [
                    nameof(StartedAtUtc),
                    nameof(EndedAtUtc)
                ]);
        }
    }
}