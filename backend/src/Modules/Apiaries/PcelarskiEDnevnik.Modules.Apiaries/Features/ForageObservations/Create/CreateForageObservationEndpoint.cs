using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Features;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Storage;

namespace PcelarskiEDnevnik.Modules.Apiaries
    .Features.ForageObservations.Create;

public static class
    CreateForageObservationEndpoint {
    public static IEndpointRouteBuilder
        MapCreateForageObservationEndpoint(
            this IEndpointRouteBuilder endpoints) {
        var endpoint = endpoints.MapPost(
            "/",
            async (
                [FromForm] CreateForageObservationRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                IImageStorage imageStorage,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    if (!ImageUpload.TryValidate(
                            request.Image,
                            out var imageFileExtension,
                            out var imageError)) {
                        return Results.ValidationProblem(
                            new Dictionary<string, string[]> {
                                ["image"] = [imageError!]
                            });
                    }

                    var imagePath = await ImageUpload.SaveAsync(
                        request.Image,
                        imageFileExtension,
                        ImageStorageArea.ForageObservations,
                        imageStorage,
                        cancellationToken);

                    var location =
                        ApiaryLocation.Create(
                            beekeeperId,
                            name: null,
                            request.Latitude!.Value,
                            request.Longitude!.Value,
                            altitudeMeters: null,
                            cadastralParcelNumber: null,
                            description: null);

                    var forageProfileId =
                        await ForageObservationProfileResolver
                            .ResolveAsync(
                                beekeeperId,
                                request.Latitude.Value,
                                request.Longitude.Value,
                                request.ObservedAt!.Value,
                                dbContext,
                                cancellationToken);

                    var observation =
                        ForageObservation.Create(
                            beekeeperId,
                            request.ObservedAt.Value,
                            request.ForageType!.Value,
                            request.Intensity!.Value,
                            request.Notes,
                            location.Id,
                            forageProfileId,
                            imagePath);

                    dbContext
                        .Set<ApiaryLocation>()
                        .Add(location);

                    dbContext
                        .ForageObservations
                        .Add(observation);

                    await dbContext.SaveChangesAsync(
                        cancellationToken);

                    return Results.Created(
                        $"/api/forage-observations/{observation.Id}",
                        new CreateForageObservationResponse(
                            observation.Id,
                            observation.ForageProfileId,
                            ImageUpload.ToImageUrl(
                                observation.ImagePath)));
                });

        endpoint.DisableAntiforgery();

        return endpoints;
    }
}
