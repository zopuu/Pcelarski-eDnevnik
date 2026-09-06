using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;

namespace PcelarskiEDnevnik.Api.Features.Profile;

public sealed record UpdateMyProfileRequest {
    [Required]
    [StringLength(BeekeeperProfileRules.FirstNameMaxLength)]
    public required string FirstName { get; init; }

    [Required]
    [StringLength(BeekeeperProfileRules.LastNameMaxLength)]
    public required string LastName { get; init; }

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public required string Email { get; init; }

    [StringLength(BeekeeperProfileRules.HidMaxLength)]
    public string? Hid { get; init; }

    [Phone]
    [StringLength(BeekeeperProfileRules.PhoneMaxLength)]
    public string? Phone { get; init; }

    [Range(1, int.MaxValue)]
    public int? AgriculturalHoldingNumber { get; init; }

}
