using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Identity.Domain;

namespace PcelarskiEDnevnik.Modules.Identity.Infrastructure.Persistence;

public sealed class IdentityModuleDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid> {
    public IdentityModuleDbContext(
        DbContextOptions<IdentityModuleDbContext> options)
        : base(options) {
    }

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("identity");

        builder.Entity<ApplicationUser>()
            .ToTable("users");

        builder.Entity<IdentityRole<Guid>>()
            .ToTable("roles");

        builder.Entity<IdentityUserRole<Guid>>()
            .ToTable("user_roles");

        builder.Entity<IdentityUserClaim<Guid>>()
            .ToTable("user_claims");

        builder.Entity<IdentityUserLogin<Guid>>()
            .ToTable("user_logins");

        builder.Entity<IdentityUserToken<Guid>>()
            .ToTable("user_tokens");

        builder.Entity<IdentityRoleClaim<Guid>>()
            .ToTable("role_claims");
    }
}