using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Relocations.Domain;

using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Relocations.Features.Create;

public sealed record CreateRelocationRequest :
    IValidatableObject {
    [Required]
    [EnumDataType(typeof(RelocationKind))]
    public RelocationKind Kind { get; init; }

    public Guid SourceApiaryId { get; init; }

    public Guid? DestinationLocationId { get; init; }

    public Guid? DestinationApiaryId { get; init; }

    [EnumDataType(
        typeof(HiveEntranceOrientation),
        ErrorMessage =
            "Invalid destination apiary orientation.")]
    public HiveEntranceOrientation? DestinationOrientation { get; init; }

    [StringLength(ApiaryStayRules.NoteMaxLength)]
    public string? DestinationStayNote { get; init; }

    public List<Guid>? HiveIds { get; init; }

    public DateTimeOffset OccurredAtUtc { get; init; }

    [Range(
        typeof(decimal),
        "0",
        "9999999999.99")]
    public decimal? CostAmount { get; init; }

    [RegularExpression(
        @"^[A-Z]{3}$",
        ErrorMessage =
            "Currency code must contain exactly three uppercase letters.")]
    public string? CurrencyCode { get; init; }

    [Required]
    [EnumDataType(
        typeof(RelocationTransportMethod),
        ErrorMessage = "Invalid transport method.")]
    public RelocationTransportMethod TransportMethod { get; init; }

    [Range(
        typeof(decimal),
        "0",
        "999999.99")]
    public decimal? DistanceKm { get; init; }

    [StringLength(1000)]
    public string? Notes { get; init; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext) {
        if (SourceApiaryId == Guid.Empty) {
            yield return new ValidationResult(
                "Source apiary is required.",
                [nameof(SourceApiaryId)]);
        }
        var hasCurrencyCode =
            !string.IsNullOrWhiteSpace(
                CurrencyCode);

                if (CostAmount.HasValue !=
                    hasCurrencyCode) {
                    yield return
                        new ValidationResult(
                            "Cost amount and currency code must be supplied together.",
                            [
                                nameof(CostAmount),
                        nameof(CurrencyCode)
                            ]);
        }

        if (OccurredAtUtc == default) {
            yield return new ValidationResult(
                "Relocation date is required.",
                [nameof(OccurredAtUtc)]);
        }

        if (Kind ==
            RelocationKind.WholeApiary) {
            if (!DestinationLocationId.HasValue) {
                yield return new ValidationResult(
                    "Destination location is required.",
                    [nameof(DestinationLocationId)]);
            }

            if (!DestinationOrientation.HasValue) {
                yield return new ValidationResult(
                    "Destination orientation is required.",
                    [nameof(DestinationOrientation)]);
            }

            if (DestinationApiaryId.HasValue) {
                yield return new ValidationResult(
                    "Destination apiary must not be supplied for whole-apiary relocation.",
                    [nameof(DestinationApiaryId)]);
            }

            if (HiveIds is { Count: > 0 }) {
                yield return new ValidationResult(
                    "Hive IDs must not be supplied for whole-apiary relocation.",
                    [nameof(HiveIds)]);
            }
        }

        if (Kind ==
            RelocationKind.SelectedHives) {
            if (!DestinationApiaryId.HasValue) {
                yield return new ValidationResult(
                    "Destination apiary is required.",
                    [nameof(DestinationApiaryId)]);
            }

            if (DestinationLocationId.HasValue) {
                yield return new ValidationResult(
                    "Destination location must not be supplied for selected-hives relocation.",
                    [nameof(DestinationLocationId)]);
            }

            if (DestinationOrientation.HasValue) {
                yield return new ValidationResult(
                    "Destination orientation must not be supplied for selected-hives relocation.",
                    [nameof(DestinationOrientation)]);
            }

            if (!string.IsNullOrWhiteSpace(
                    DestinationStayNote)) {
                yield return new ValidationResult(
                    "Destination stay note must not be supplied for selected-hives relocation.",
                    [nameof(DestinationStayNote)]);
            }

            if (HiveIds is null ||
                HiveIds.Count == 0) {
                yield return new ValidationResult(
                    "At least one hive must be selected.",
                    [nameof(HiveIds)]);
            }

            if (HiveIds is not null &&
                HiveIds.Distinct().Count() !=
                HiveIds.Count) {
                yield return new ValidationResult(
                    "Hive IDs must be unique.",
                    [nameof(HiveIds)]);
            }
        }
    }
}
