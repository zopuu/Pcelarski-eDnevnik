using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Locations.Create;

public sealed record CreateLocationRequest {
    [StringLength(ApiaryLocationRules.NameMaxLength)]
    public string? Name { get; init; }

    [Required]
    [Range(
        typeof(decimal),
        "-90",
        "90",
        ErrorMessage =
            "Latitude must be between -90 and 90.")]
    public decimal? Latitude { get; init; }

    [Required]
    [Range(
        typeof(decimal),
        "-180",
        "180",
        ErrorMessage =
            "Longitude must be between -180 and 180.")]
    public decimal? Longitude { get; init; }

    public int? AltitudeMeters { get; init; }

    [StringLength(
        ApiaryLocationRules.CadastralParcelNumberMaxLength)]
    public string? CadastralParcelNumber { get; init; }

    [StringLength(
        ApiaryLocationRules.DescriptionMaxLength)]
    public string? Description { get; init; }
}