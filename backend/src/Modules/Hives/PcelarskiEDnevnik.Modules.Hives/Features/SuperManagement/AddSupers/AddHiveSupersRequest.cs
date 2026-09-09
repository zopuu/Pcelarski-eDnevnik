using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.AddSupers;

public sealed record AddHiveSupersRequest {
    [Range(
        1,
        SuperManagementRules.MaximumSupersPerOperation,
        ErrorMessage = "Number of supers must be between 1 and 10.")]
    public int SuperCount { get; init; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Frame count must be greater than zero.")]
    public int FrameCount { get; init; }

    [Required]
    [RegularExpression(
        @"^#[0-9A-Fa-f]{6}$",
        ErrorMessage = "Color must use #RRGGBB format.")]
    public string ColorHex { get; init; } = null!;
}