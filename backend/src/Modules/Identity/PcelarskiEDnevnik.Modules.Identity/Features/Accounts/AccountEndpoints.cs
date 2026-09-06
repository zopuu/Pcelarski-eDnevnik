using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Identity.Domain;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Identity.Features.Accounts;

public static class AccountEndpoints {
    public static IEndpointRouteBuilder MapAccountEndpoints(
        this IEndpointRouteBuilder endpoints) {
        var group = endpoints
            .MapGroup("/api/account")
            .WithTags("Account")
            .RequireAuthorization();

        group
            .MapPut("/password", ChangePasswordAsync)
            .WithName("ChangeMyPassword")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return endpoints;
    }

    private static async Task<IResult> ChangePasswordAsync(
        ChangePasswordRequest request,
        ICurrentUserContext currentUser,
        UserManager<ApplicationUser> userManager) {
        var user = await userManager.FindByIdAsync(
            currentUser.UserId.ToString());

        if (user is null) {
            return Results.NotFound();
        }

        var result = await userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (result.Succeeded) {
            return Results.NoContent();
        }

        var errors = result.Errors.Any(error =>
            error.Code == "PasswordMismatch")
            ? new Dictionary<string, string[]> {
                ["currentPassword"] = [
                    "The current password is incorrect."
                ]
            }
            : new Dictionary<string, string[]> {
                ["newPassword"] = [
                    "The new password does not meet the security requirements."
                ]
            };

        return Results.ValidationProblem(errors);
    }
}
