using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.SharedKernel.Errors;
using PcelarskiEDnevnik.SharedKernel.Storage;
using Microsoft.AspNetCore.Mvc;
namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;


public static class CreateApiaryEndpoint {
    public static IEndpointRouteBuilder MapCreateApiaryEndpoint(
        this IEndpointRouteBuilder endpoints) {
        var endpoint = endpoints.MapPost(
            "/",
            async (
                [FromForm] CreateApiaryRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                IImageStorage imageStorage,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    if (!ApiaryImageUpload.TryValidate(
                            request.Image,
                            out var imageFileExtension,
                            out var imageError)) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                ["image"] = [imageError!]
                            });
                    }

                    var stayRequest = request.InitialStay;
                    var locationRequest = stayRequest.Location;

                    var imagePath = await ApiaryImageUpload.SaveAsync(
                        request.Image,
                        imageFileExtension,
                        imageStorage,
                        cancellationToken);

                    var apiary = Apiary.Create(
                        beekeeperId,
                        request.IdentificationNumber,
                        request.Name,
                        request.Type,
                        ApiaryStatus.Active,
                        imagePath);

                    var location = ApiaryLocation.Create(
                        beekeeperId,
                        locationRequest.Name,
                        locationRequest.Latitude!.Value,
                        locationRequest.Longitude!.Value,
                        locationRequest.AltitudeMeters,
                        locationRequest.CadastralParcelNumber,
                        locationRequest.Description);

                    var stay = ApiaryStay.Create(
                        apiary.Id,
                        location.Id,
                        DateTimeOffset.UtcNow,
                        null,
                        orientation: stayRequest.Orientation,
                        note: stayRequest.Note);

                    dbContext.Apiaries.Add(apiary);
                    dbContext.Locations.Add(location);
                    dbContext.ApiaryStays.Add(stay);

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
                        new CreateApiaryResponse(
                            apiary.Id,
                            apiary.IdentificationNumber,
                            apiary.Name,
                            ApiaryImageUpload.ToImageUrl(apiary.ImagePath),
                            apiary.Type,
                            apiary.Status,
                            apiary.CreatedAtUtc);

                    return Results.Created(
                        $"/api/apiaries/{apiary.Id}",
                        response);
                });

        endpoint.DisableAntiforgery();

        return endpoints;
    }
}
