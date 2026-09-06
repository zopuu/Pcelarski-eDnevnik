using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Identity.Features.Accounts;

public sealed record ChangePasswordRequest {
    [Required]
    public required string CurrentPassword { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public required string NewPassword { get; init; }
}
