using Microsoft.AspNetCore.Mvc;
using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Application;
using PcelarskiEDnevnik.Modules.Identity.Application;

namespace PcelarskiEDnevnik.Api.Features.Registration;

public static class RegistrationEndpoints {
    public static IEndpointRouteBuilder MapRegistrationEndpoints(
        this IEndpointRouteBuilder endpoints) {
        var group = endpoints
            .MapGroup("/api/auth")
            .WithTags("Autentikacija");

        group
            .MapPost("/register", RegisterAsync)
            .AllowAnonymous()
            .WithName("RegisterBeekeeper")
            .Produces<RegisterBeekeeperResponse>(
                StatusCodes.Status201Created)
            .ProducesValidationProblem(
                StatusCodes.Status400BadRequest)
            .ProducesProblem(
                StatusCodes.Status409Conflict);

        return endpoints;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterBeekeeperRequest request,
        IUserRegistrationService userRegistrationService,
        IBeekeeperProfileRegistrationService profileRegistrationService,
        ILoggerFactory loggerFactory,
        CancellationToken cancellationToken) {
        var logger =
            loggerFactory.CreateLogger(
                "BeekeeperRegistration");

        var userResult =
            await userRegistrationService.CreateUserAsync(
                request.Email,
                request.Password,
                cancellationToken);

        if (!userResult.Succeeded) {
            return MapIdentityFailure(userResult);
        }

        var userId = userResult.UserId!.Value;

        BeekeeperProfileRegistrationResult profileResult;

        try {
            profileResult =
                await profileRegistrationService.CreateAsync(
                    new CreateBeekeeperProfileCommand(
                        userId,
                        request.FirstName,
                        request.LastName,
                        request.Hid,
                        request.Phone,
                        request.AgriculturalHoldingNumber),
                    cancellationToken);
        }
        catch {
            await TryDeleteIdentityUserAsync(
                userId,
                userRegistrationService,
                logger);

            throw;
        }

        if (!profileResult.Succeeded) {
            var cleanupSucceeded =
                await TryDeleteIdentityUserAsync(
                    userId,
                    userRegistrationService,
                    logger);

            if (!cleanupSucceeded) {
                return Results.Problem(
                    statusCode:
                        StatusCodes.Status500InternalServerError,
                    title:
                        "Registration could not be completed.",
                    detail:
                        "The user account was created but profile creation failed.");
            }

            return MapProfileFailure(profileResult);
        }

        var response = new RegisterBeekeeperResponse(
            userId,
            profileResult.ProfileId!.Value,
            request.Email.Trim());

        return Results.Json(
            response,
            statusCode: StatusCodes.Status201Created);
    }

    private static IResult MapIdentityFailure(
        UserRegistrationResult result) {
        var duplicate =
            result.Errors.Any(error =>
                error.Code is
                    "DuplicateEmail" or
                    "DuplicateUserName");

        if (duplicate) {
            return Results.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "User already exists.",
                detail:
                    "An account with this email already exists.");
        }

        var errors = result.Errors
            .Select(error => error.Description)
            .ToArray();

        return Results.ValidationProblem(
            new Dictionary<string, string[]> {
                ["identity"] = errors
            });
    }

    private static IResult MapProfileFailure(
        BeekeeperProfileRegistrationResult result) {
        var detail = result.Error switch {
            BeekeeperProfileRegistrationError
                .UserAlreadyHasProfile =>
                "The user already has a beekeeper profile.",

            BeekeeperProfileRegistrationError
                .HidAlreadyExists =>
                "The specified HID is already in use.",

            BeekeeperProfileRegistrationError
                .AgriculturalHoldingNumberAlreadyExists =>
                "The specified agricultural holding number is already in use.",

            _ =>
                "The beekeeper profile could not be created."
        };

        return Results.Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Beekeeper profile conflict.",
            detail: detail);
    }

    private static async Task<bool> TryDeleteIdentityUserAsync(
        Guid userId,
        IUserRegistrationService userRegistrationService,
        ILogger logger) {
        try {
            await userRegistrationService.DeleteUserAsync(
                userId,
                CancellationToken.None);

            return true;
        }
        catch (Exception exception) {
            logger.LogCritical(
                exception,
                "Failed to remove Identity user {UserId} after registration failure.",
                userId);

            return false;
        }
    }
}