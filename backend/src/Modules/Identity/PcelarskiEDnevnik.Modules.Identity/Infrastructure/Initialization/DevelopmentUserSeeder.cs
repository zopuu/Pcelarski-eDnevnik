using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using PcelarskiEDnevnik.Modules.Identity.Domain;

namespace PcelarskiEDnevnik.Modules.Identity.Infrastructure.Initialization;

internal sealed class DevelopmentUserSeeder {
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public DevelopmentUserSeeder(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration) {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task SeedAsync() {
        var email =
            _configuration[
                "Identity:DevelopmentUser:Email"];

        var password =
            _configuration[
                "Identity:DevelopmentUser:Password"];

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password)) {
            return;
        }

        var existing =
            await _userManager.FindByEmailAsync(email);

        if (existing is not null) {
            return;
        }

        var user = new ApplicationUser {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = email,
            EmailConfirmed = true
        };

        var result =
            await _userManager.CreateAsync(
                user,
                password);

        if (!result.Succeeded) {
            var errors = string.Join(
                "; ",
                result.Errors.Select(
                    error =>
                        $"{error.Code}: {error.Description}"));

            throw new InvalidOperationException(
                $"Development user could not be created: {errors}");
        }
    }
}