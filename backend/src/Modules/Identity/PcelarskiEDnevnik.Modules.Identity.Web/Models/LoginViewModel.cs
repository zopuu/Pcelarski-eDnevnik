using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Identity.Web.Models;

public sealed class LoginViewModel {
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; init; } = string.Empty;

    public bool RememberMe { get; init; }

    public string? ReturnUrl { get; init; }
}