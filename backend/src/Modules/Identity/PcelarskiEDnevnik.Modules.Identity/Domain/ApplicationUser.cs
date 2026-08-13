using Microsoft.AspNetCore.Identity;

namespace PcelarskiEDnevnik.Modules.Identity.Domain;

public sealed class ApplicationUser : IdentityUser<Guid> {
    public DateTimeOffset CreatedAtUtc { get; set; }
        = DateTimeOffset.UtcNow;
}