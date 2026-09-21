using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;
using PcelarskiEDnevnik.SharedKernel.Storage;
using Microsoft.AspNetCore.Mvc;
using PcelarskiEDnevnik.Modules.Apiaries.Features;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Update;

public static class UpdateApiaryEndpoint {
    public static IEndpointRouteBuilder MapUpdateApiaryEndpoint(
        this IEndpointRouteBuilder endpoints) {
        var endpoint = endpoints.MapPut(
            "/{id:guid}",
            async (
                Guid id,
                [FromForm] UpdateApiaryRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                IImageStorage imageStorage,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var apiary =
                        await dbContext.Apiaries
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == id &&
                                    x.OwnerBeekeeperId == beekeeperId &&
                                    x.Status != PcelarskiEDnevnik.Modules.Apiaries.Domain.ApiaryStatus.Inactive,
                                cancellationToken);

                    if (apiary is null) {
                        return Results.NotFound();
                    }

                    if (!ImageUpload.TryValidate(
                            request.Image,
                            out var imageFileExtension,
                            out var imageError)) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                ["image"] = [imageError!]
                            });
                    }

                    apiary.Update(
                        request.IdentificationNumber,
                        request.Name,
                        request.Type!.Value);

                    var imagePath = await ImageUpload.SaveAsync(
                        request.Image,
                        imageFileExtension,
                        ImageStorageArea.Apiaries,
                        imageStorage,
                        cancellationToken);

                    if (imagePath is not null) {
                        apiary.UpdateImagePath(imagePath);
                    }

                    try {
                        await dbContext.SaveChangesAsync(
                            cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (
                            ApiaryPersistenceErrors
                                .IsIdentificationNumberUniqueViolation(
                                    exception)) {
                        throw new ConflictException(
                            "apiaries.identification_number_already_exists",
                            "An apiary with this identification number already exists.",
                            exception);
                    }

                    var response =
                        new UpdateApiaryResponse(
                            apiary.Id,
                            apiary.IdentificationNumber,
                            apiary.Name,
                            ImageUpload.ToImageUrl(apiary.ImagePath),
                            apiary.Type,
                            apiary.Status,
                            apiary.CreatedAtUtc,
                            apiary.UpdatedAtUtc);

                    return Results.Ok(response);
                });

        endpoint.DisableAntiforgery();

        return endpoints;
    }
}
