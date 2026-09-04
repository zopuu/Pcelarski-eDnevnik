using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.Update;

public static class UpdateForageObservationEndpoint {
    public static IEndpointRouteBuilder
        MapUpdateForageObservationEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut(
            "/{observationId:guid}",
            async (
                Guid observationId,
                UpdateForageObservationRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var observation =
                        await dbContext
                            .ForageObservations
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id
                                        == observationId
                                    &&
                                    x.ObservedByBeekeeperId
                                        == beekeeperId,
                                cancellationToken);

                    if (observation is null) {
                        return Results.NotFound();
                    }

                    var location =
                        await dbContext
                            .Set<ApiaryLocation>()
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id
                                        == observation.LocationId
                                    &&
                                    x.OwnerBeekeeperId
                                        == beekeeperId,
                                cancellationToken);

                    if (location is null) {
                        return Results.NotFound();
                    }

                    var forageProfileId =
                        await ForageObservationProfileResolver
                            .ResolveAsync(
                                beekeeperId,
                                request.Latitude!.Value,
                                request.Longitude!.Value,
                                request.ObservedAt!.Value,
                                dbContext,
                                cancellationToken);

                    location.Update(
                        name: null,
                        latitude:
                            request.Latitude.Value,
                        longitude:
                            request.Longitude.Value,
                        altitudeMeters: null,
                        cadastralParcelNumber: null,
                        description: null);

                    observation.Update(
                        request.ObservedAt.Value,
                        request.ForageType!.Value,
                        request.Intensity!.Value,
                        request.Notes,
                        forageProfileId);

                    await dbContext
                        .SaveChangesAsync(
                            cancellationToken);

                    var response =
                        new UpdateForageObservationResponse(
                            observation.Id,
                            observation.ObservedAt,
                            observation.ForageType,
                            observation.Intensity,
                            observation.Notes,
                            location.Latitude,
                            location.Longitude,
                            observation.ForageProfileId,
                            observation.UpdatedAtUtc!.Value);

                    return Results.Ok(response);
                });

        return endpoints;
    }
}