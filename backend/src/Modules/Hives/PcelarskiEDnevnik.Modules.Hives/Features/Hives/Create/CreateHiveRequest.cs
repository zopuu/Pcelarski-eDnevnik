using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.Create;

public sealed record CreateHiveRequest {
    [StringLength(
    HiveRules.IdentificationNumberLength,
    MinimumLength = HiveRules.IdentificationNumberLength,
    ErrorMessage =
        "Hive identification number must contain exactly 10 characters.")]
    [RegularExpression(
    HiveRules.IdentificationNumberPattern,
    ErrorMessage =
        "Hive identification number must have format RS followed by 8 digits.")]
    public string? IdentificationNumber { get; init; }

    [Required(
        ErrorMessage =
            "Hive label is required.")]
    [StringLength(
        HiveRules.LabelMaxLength,
        ErrorMessage =
            "Hive label cannot exceed 10 characters.")]
    public string? Label { get; init; }

    [Required(
        ErrorMessage =
            "Hive type is required.")]
    [EnumDataType(
        typeof(HiveType),
        ErrorMessage =
            "Invalid hive type.")]
    public HiveType? Type { get; init; }

    [RegularExpression(
        HiveRules.ColorHexPattern,
        ErrorMessage =
            "Color must have hexadecimal format #RRGGBB.")]
    public string? ColorHex { get; init; }

    public DateOnly? ManufactureDate { get; init; }

    [StringLength(
        HiveRules.ManufacturerMaxLength,
        ErrorMessage =
            "Manufacturer cannot exceed 80 characters.")]
    public string? Manufacturer { get; init; }

    [EnumDataType(
        typeof(HiveMaterial),
        ErrorMessage =
            "Invalid hive material.")]
    public HiveMaterial? Material { get; init; }

    public DateOnly? PurchaseDate { get; init; }
}