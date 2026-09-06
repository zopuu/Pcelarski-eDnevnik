using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Identity.Domain;
using PcelarskiEDnevnik.Modules.Identity.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Api.Features.Profile;

public static class UpdateMyProfileEndpoint {
    public static IEndpointRouteBuilder MapUpdateMyProfileEndpoint(
        this IEndpointRouteBuilder endpoints) {
        var group = endpoints
            .MapGroup("/api/profile")
            .WithTags("Profile")
            .RequireAuthorization();

        group
            .MapPut("/me", UpdateAsync)
            .WithName("UpdateMyProfile")
            .Produces<UpdateMyProfileResponse>()
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return endpoints;
    }

    private static async Task<IResult> UpdateAsync(
        UpdateMyProfileRequest request,
        ICurrentUserContext currentUser,
        UserManager<ApplicationUser> userManager,
        IdentityModuleDbContext identityDbContext,
        BeekeeperProfilesDbContext profilesDbContext,
        CancellationToken cancellationToken) {
        var profile = await profilesDbContext.BeekeeperProfiles
            .SingleOrDefaultAsync(
                x => x.UserId == currentUser.UserId,
                cancellationToken);

        if (profile is null) {
            return Results.NotFound();
        }

        var user = await userManager.FindByIdAsync(
            currentUser.UserId.ToString());

        if (user is null) {
            return Results.NotFound();
        }

        var email = request.Email.Trim();
        var connection = identityDbContext.Database.GetDbConnection();

        await connection.OpenAsync(cancellationToken);
        profilesDbContext.Database.SetDbConnection(
            connection,
            contextOwnsConnection: false);

        await using var transaction =
            await identityDbContext.Database.BeginTransactionAsync(
                cancellationToken);

        await profilesDbContext.Database.UseTransactionAsync(
            transaction.GetDbTransaction(),
            cancellationToken);

        user.Email = email;
        user.UserName = email;

        var userUpdateResult = await userManager.UpdateAsync(user);

        if (!userUpdateResult.Succeeded) {
            if (userUpdateResult.Errors.Any(error =>
                    error.Code is "DuplicateEmail" or "DuplicateUserName")) {
                throw new ConflictException(
                    "identity.email_already_exists",
                    "An account with this email already exists.");
            }

            return Results.ValidationProblem(
                new Dictionary<string, string[]> {
                    ["email"] = [
                        "The email address could not be updated."
                    ]
                });
        }

        profile.Update(
            request.FirstName,
            request.LastName,
            request.Hid,
            request.Phone,
            request.AgriculturalHoldingNumber);

        try {
            await profilesDbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException {
                SqlState: PostgresErrorCodes.UniqueViolation
            } postgresException) {
            throw CreateProfileConflictException(
                postgresException,
                exception);
        }

        await transaction.CommitAsync(cancellationToken);

        return Results.Ok(
            new UpdateMyProfileResponse(
                profile.Id,
                profile.FirstName,
                profile.LastName,
                user.Email!,
                profile.Hid,
                profile.Phone,
                profile.AgriculturalHoldingNumber));
    }

    private static ConflictException CreateProfileConflictException(
        PostgresException exception,
        Exception innerException) {
        return exception.ConstraintName switch {
            "ux_beekeeper_profiles_hid" =>
                new ConflictException(
                    "beekeeper_profiles.hid_already_exists",
                    "The specified HID is already in use.",
                    innerException),

            "ux_beekeeper_profiles_agricultural_holding_number" =>
                new ConflictException(
                    "beekeeper_profiles.agricultural_holding_number_already_exists",
                    "The specified agricultural holding number is already in use.",
                    innerException),

            _ => throw innerException
        };
    }
}
