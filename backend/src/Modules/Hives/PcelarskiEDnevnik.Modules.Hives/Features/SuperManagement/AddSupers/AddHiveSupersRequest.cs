using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;
namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.AddSupers;

public sealed record AddHiveSupersRequest {
    [Required]
    [MinLength(1)]
    [MaxLength(SuperManagementRules.MaximumSupersPerOperation)]
    public IReadOnlyList<AddHiveSuperItemRequest> Supers { get; init; } = [];
}

public sealed record AddHiveSuperItemRequest {
    [Range(1, int.MaxValue, ErrorMessage = "Frame count must be greater than zero.")]
    public int FrameCount { get; init; }

    [Required]
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "Color must use #RRGGBB format.")]
    public string ColorHex { get; init; } = null!;
}
