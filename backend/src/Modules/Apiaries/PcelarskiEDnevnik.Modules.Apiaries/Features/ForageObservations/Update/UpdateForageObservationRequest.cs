using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.Update;

public sealed record UpdateForageObservationRequest {
    [Required]
    public DateTimeOffset? ObservedAt {
        get;
        init;
    }

    [Required]
    [EnumDataType(
        typeof(ForageType),
        ErrorMessage =
            "Invalid forage type.")]
    public ForageType? ForageType {
        get;
        init;
    }

    [Required]
    [Range(
        ForageObservationRules.IntensityMin,
        ForageObservationRules.IntensityMax,
        ErrorMessage =
            "Intensity must be between 1 and 5.")]
    public short? Intensity {
        get;
        init;
    }

    [StringLength(
        ForageObservationRules.NotesMaxLength,
        ErrorMessage =
            "Notes cannot exceed 1000 characters.")]
    public string? Notes {
        get;
        init;
    }

    [Required]
    [Range(
        typeof(decimal),
        "-90",
        "90",
        ErrorMessage =
            "Latitude must be between -90 and 90.")]
    public decimal? Latitude {
        get;
        init;
    }

    [Required]
    [Range(
        typeof(decimal),
        "-180",
        "180",
        ErrorMessage =
            "Longitude must be between -180 and 180.")]
    public decimal? Longitude {
        get;
        init;
    }
}