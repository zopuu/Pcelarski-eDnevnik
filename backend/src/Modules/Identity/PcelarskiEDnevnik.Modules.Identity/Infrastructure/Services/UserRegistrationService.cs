using Microsoft.AspNetCore.Identity;
using PcelarskiEDnevnik.Modules.Identity.Application;
using PcelarskiEDnevnik.Modules.Identity.Domain;

namespace PcelarskiEDnevnik.Modules.Identity.Infrastructure.Services;

internal sealed class UserRegistrationService
    : IUserRegistrationService {
    private readonly UserManager<ApplicationUser> _userManager;

    public UserRegistrationService(
        UserManager<ApplicationUser> userManager) {
        _userManager = userManager;
    }

    public async Task<UserRegistrationResult> CreateUserAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default) {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedEmail = email.Trim();

        var user = new ApplicationUser {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            UserName = normalizedEmail,
            EmailConfirmed = false
        };

        var result = await _userManager.CreateAsync(
            user,
            password);

        if (result.Succeeded) {
            return UserRegistrationResult.Success(user.Id);
        }

        var errors = result.Errors
            .Select(error =>
                new UserRegistrationError(
                    error.Code,
                    error.Description))
            .ToArray();

        return UserRegistrationResult.Failure(errors);
    }

    public async Task DeleteUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default) {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await _userManager.FindByIdAsync(
            userId.ToString());

        if (user is null) {
            return;
        }

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded) {
            var errors = string.Join(
                "; ",
                result.Errors.Select(
                    error =>
                        $"{error.Code}: {error.Description}"));

            throw new InvalidOperationException(
                $"Identity user cleanup failed: {errors}");
        }
    }
}