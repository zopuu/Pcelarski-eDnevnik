using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetAll;

public static class GetForageObservationsEndpoint {
    public static IEndpointRouteBuilder
        MapGetForageObservationsEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/",
            async (
                [AsParameters]
                GetForageObservationsRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var query =
                        from observation
                            in dbContext
                                .ForageObservations
                                .AsNoTracking()

                        join location
                            in dbContext
                                .Set<ApiaryLocation>()
                                .AsNoTracking()
                            on observation.LocationId
                            equals location.Id

                        join profile
                            in dbContext
                                .ForageProfiles
                                .AsNoTracking()
                            on observation.ForageProfileId
                            equals profile.Id
                            into profileGroup

                        from profile
                            in profileGroup
                                .DefaultIfEmpty()

                        where
                            observation
                                .ObservedByBeekeeperId
                            == beekeeperId

                        orderby
                            observation.ObservedAt
                                descending,
                            observation.Id
                                descending

                        select
                            new ForageObservationListItemResponse(
                                observation.Id,
                                observation.ObservedAt,
                                observation.ForageType,
                                observation.Intensity,
                                observation.Notes,
                                location.Latitude,
                                location.Longitude,
                                observation.ForageProfileId,
                                profile != null
                                    ? profile.Name
                                    : null,
                                observation.CreatedAtUtc,
                                observation.UpdatedAtUtc);

                    var skip =
                        (request.Page - 1)
                        * request.PageSize;

                    var items =
                        await query
                            .Skip(skip)
                            .Take(
                                request.PageSize + 1)
                            .ToListAsync(
                                cancellationToken);

                    var hasMore =
                        items.Count
                        > request.PageSize;

                    if (hasMore) {
                        items.RemoveAt(
                            items.Count - 1);
                    }

                    var response =
                        new GetForageObservationsResponse(
                            items,
                            request.Page,
                            request.PageSize,
                            hasMore);

                    return Results.Ok(response);
                });

        return endpoints;
    }
}