using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Update;

public sealed record UpdateApiaryRequest {
    [RegularExpression(
        ApiaryRules.IdentificationNumberPattern,
        ErrorMessage =
            "Identification number must have format RS followed by 12 digits.")]
    public string? IdentificationNumber { get; init; }

    [Required(ErrorMessage = "Apiary name is required.")]
    [StringLength(
        ApiaryRules.NameMaxLength,
        ErrorMessage =
            "Apiary name cannot exceed 30 characters.")]
    public string? Name { get; init; }

    [Required(ErrorMessage = "Apiary type is required.")]
    [EnumDataType(
        typeof(ApiaryType),
        ErrorMessage = "Apiary type must be Stationary or Migratory.")]
    public ApiaryType? Type { get; init; }

    public Microsoft.AspNetCore.Http.IFormFile? Image { get; init; }
}
