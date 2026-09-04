using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries
    .Features.ForageObservations.Create;

public sealed record
    CreateForageObservationRequest {
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
        ForageObservationRules
            .IntensityMin,
        ForageObservationRules
            .IntensityMax)]
    public short? Intensity {
        get;
        init;
    }

    [StringLength(
        ForageObservationRules
            .NotesMaxLength)]
    public string? Notes {
        get;
        init;
    }

    [Required]
    [Range(
        typeof(decimal),
        "-90",
        "90")]
    public decimal? Latitude {
        get;
        init;
    }

    [Required]
    [Range(
        typeof(decimal),
        "-180",
        "180")]
    public decimal? Longitude {
        get;
        init;
    }
}