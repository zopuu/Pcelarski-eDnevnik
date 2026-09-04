using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries
    .Features.ForageObservations.Create;

public static class
    CreateForageObservationEndpoint {
    public static IEndpointRouteBuilder
        MapCreateForageObservationEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            async (
                CreateForageObservationRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
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
                            forageProfileId);

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
                            observation.ForageProfileId));
                });

        return endpoints;
    }
}