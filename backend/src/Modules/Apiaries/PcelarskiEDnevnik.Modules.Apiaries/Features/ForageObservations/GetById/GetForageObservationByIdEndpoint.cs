using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetById;

public static class
    GetForageObservationByIdEndpoint {
    public static IEndpointRouteBuilder
        MapGetForageObservationByIdEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/{observationId:guid}",
            async (
                Guid observationId,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var observation =
                        await (
                            from forageObservation
                                in dbContext
                                    .ForageObservations
                                    .AsNoTracking()

                            join location
                                in dbContext
                                    .Set<ApiaryLocation>()
                                    .AsNoTracking()
                                on forageObservation.LocationId
                                equals location.Id

                            join forageProfile
                                in dbContext
                                    .ForageProfiles
                                    .AsNoTracking()
                                on forageObservation.ForageProfileId
                                equals forageProfile.Id
                                into forageProfileGroup

                            from forageProfile
                                in forageProfileGroup
                                    .DefaultIfEmpty()

                            where
                                forageObservation.Id
                                    == observationId
                                &&
                                forageObservation
                                    .ObservedByBeekeeperId
                                    == beekeeperId

                            select
                                new GetForageObservationByIdResponse(
                                    forageObservation.Id,
                                    forageObservation.ObservedAt,
                                    forageObservation.ForageType,
                                    forageObservation.Intensity,
                                    forageObservation.Notes,
                                    location.Latitude,
                                    location.Longitude,
                                    forageObservation.ForageProfileId,
                                    forageProfile != null
                                        ? forageProfile.Name
                                        : null,
                                    forageObservation.CreatedAtUtc,
                                    forageObservation.UpdatedAtUtc)
                        )
                        .SingleOrDefaultAsync(
                            cancellationToken);

                    if (observation is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(
                        observation);
                });

        return endpoints;
    }
}