using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;

public sealed record CreateApiaryRequest {
    [RegularExpression(
        ApiaryRules.IdentificationNumberPattern,
        ErrorMessage =
            "Identification number must have format RS followed by 12 digits.")]
    public string? IdentificationNumber { get; init; }

    [Required(ErrorMessage = "Apiary name is required.")]
    [StringLength(
        ApiaryRules.NameMaxLength,
        ErrorMessage = "Apiary name cannot exceed 30 characters.")]
    public string? Name { get; init; }

    [Required(ErrorMessage = "Apiary type is required.")]
    [EnumDataType(
        typeof(ApiaryType),
        ErrorMessage = "Apiary type must be Stationary or Migratory.")]
    public ApiaryType? Type { get; init; }

    public Microsoft.AspNetCore.Http.IFormFile? Image { get; init; }

    [Required]
    public required CreateInitialApiaryStayRequest InitialStay {
        get;
        init;
    }
}
public sealed record CreateInitialApiaryStayRequest {
    [Required]
    public required CreateApiaryLocationRequest Location {
        get;
        init;
    }

    [EnumDataType(
        typeof(HiveEntranceOrientation))]
    public HiveEntranceOrientation? Orientation {
        get;
        init;
    }

    [StringLength(
        ApiaryStayRules.NoteMaxLength)]
    public string? Note { get; init; }
}
public sealed record CreateApiaryLocationRequest {
    [StringLength(
        ApiaryLocationRules.NameMaxLength)]
    public string? Name { get; init; }

    [Required]
    [Range(
        typeof(decimal),
        "-90",
        "90")]
    public decimal? Latitude { get; init; }

    [Required]
    [Range(
        typeof(decimal),
        "-180",
        "180")]
    public decimal? Longitude { get; init; }

    public int? AltitudeMeters { get; init; }

    [StringLength(
        ApiaryLocationRules.CadastralParcelNumberMaxLength)]
    public string? CadastralParcelNumber { get; init; }

    [StringLength(
        ApiaryLocationRules.DescriptionMaxLength)]
    public string? Description { get; init; }
}
