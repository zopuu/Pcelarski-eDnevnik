using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Api.Features.Registration;

public sealed record RegisterBeekeeperRequest {
    [Required]
    [EmailAddress]
    [StringLength(254)]
    public required string Email { get; init; }

    [Required]
    public required string Password { get; init; }

    [Required]
    [StringLength(20)]
    public required string FirstName { get; init; }

    [Required]
    [StringLength(30)]
    public required string LastName { get; init; }

    [StringLength(12)]
    public string? Hid { get; init; }

    [StringLength(20)]
    public string? Phone { get; init; }

    public int? AgriculturalHoldingNumber { get; init; }
}