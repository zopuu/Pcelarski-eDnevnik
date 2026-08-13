using Microsoft.EntityFrameworkCore;
using Npgsql;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Application;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Services;

internal sealed class BeekeeperProfileRegistrationService
    : IBeekeeperProfileRegistrationService {
    private readonly BeekeeperProfilesDbContext _dbContext;

    public BeekeeperProfileRegistrationService(
        BeekeeperProfilesDbContext dbContext) {
        _dbContext = dbContext;
    }

    public async Task<BeekeeperProfileRegistrationResult> CreateAsync(
        CreateBeekeeperProfileCommand command,
        CancellationToken cancellationToken = default) {
        var firstName = command.FirstName.Trim();
        var lastName = command.LastName.Trim();

        var hid = NormalizeOptional(command.Hid);
        var phone = NormalizeOptional(command.Phone);

        var profile = new BeekeeperProfile(
            Guid.NewGuid(),
            command.UserId,
            firstName,
            lastName,
            hid,
            phone,
            command.AgriculturalHoldingNumber);

        _dbContext.BeekeeperProfiles.Add(profile);

        try {
            await _dbContext.SaveChangesAsync(cancellationToken);

            return BeekeeperProfileRegistrationResult.Success(
                profile.Id);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException {
                SqlState: PostgresErrorCodes.UniqueViolation
            } postgresException) {
            _dbContext.ChangeTracker.Clear();

            return postgresException.ConstraintName switch {
                "ux_beekeeper_profiles_user_id" =>
                    BeekeeperProfileRegistrationResult.Failure(
                        BeekeeperProfileRegistrationError
                            .UserAlreadyHasProfile),

                "ux_beekeeper_profiles_hid" =>
                    BeekeeperProfileRegistrationResult.Failure(
                        BeekeeperProfileRegistrationError
                            .HidAlreadyExists),

                "ux_beekeeper_profiles_agricultural_holding_number" =>
                    BeekeeperProfileRegistrationResult.Failure(
                        BeekeeperProfileRegistrationError
                            .AgriculturalHoldingNumberAlreadyExists),

                _ => throw exception
            };
        }
    }

    private static string? NormalizeOptional(string? value) {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}