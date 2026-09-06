using System.ComponentModel.DataAnnotations;

using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.Update;

public sealed record UpdateHiveRequest {
    [Required]
    [StringLength(HiveRules.LabelMaxLength)]
    public string? Label { get; init; }

    [RegularExpression(HiveRules.IdentificationNumberPattern)]
    public string? IdentificationNumber { get; init; }

    [Required]
    [EnumDataType(typeof(HiveType))]
    public HiveType? Type { get; init; }

    [RegularExpression(HiveRules.ColorHexPattern)]
    public string? ColorHex { get; init; }

    public DateOnly? ManufactureDate { get; init; }

    [StringLength(HiveRules.ManufacturerMaxLength)]
    public string? Manufacturer { get; init; }

    [EnumDataType(typeof(HiveMaterial))]
    public HiveMaterial? Material { get; init; }

    public DateOnly? PurchaseDate { get; init; }

    public bool HasFeeder { get; init; }

    [Range(1, int.MaxValue)]
    public int? FeederVolumeMl { get; init; }

    [StringLength(HiveRules.NoteMaxLength)]
    public string? Note { get; init; }
}
