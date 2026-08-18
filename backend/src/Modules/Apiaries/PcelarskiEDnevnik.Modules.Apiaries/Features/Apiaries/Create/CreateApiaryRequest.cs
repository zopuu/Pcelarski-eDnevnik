using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;

public sealed record CreateApiaryRequest {
    [RegularExpression(
        ApiaryRules.IdentificationNumberPattern,
        ErrorMessage =
            "Identification number must have format RS followed by 12 digits.")]
    public string? IdentificationNumber { get; init; }

    [StringLength(
        ApiaryRules.NameMaxLength,
        ErrorMessage =
            "Apiary name cannot exceed 30 characters.")]
    public string? Name { get; init; }

    [EnumDataType(
        typeof(ApiaryType),
        ErrorMessage = "Invalid apiary type.")]
    public ApiaryType? Type { get; init; }

    [EnumDataType(
        typeof(ApiaryStatus),
        ErrorMessage = "Invalid apiary status.")]
    public ApiaryStatus? Status { get; init; }
}