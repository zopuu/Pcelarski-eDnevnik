using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetByProfile;

public static class
    GetForageObservationsByProfileEndpoint {
    public static IEndpointRouteBuilder
        MapGetForageObservationsByProfileEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/profile/{forageProfileId:guid}",
            async (
                Guid forageProfileId,
                [AsParameters]
                GetForageObservationsByProfileRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var profile =
                        await (
                            from forageProfile
                                in dbContext
                                    .ForageProfiles
                                    .AsNoTracking()

                            join stay
                                in dbContext
                                    .ApiaryStays
                                    .AsNoTracking()
                                on forageProfile.ApiaryStayId
                                equals stay.Id

                            join apiary
                                in dbContext
                                    .Apiaries
                                    .AsNoTracking()
                                on stay.ApiaryId
                                equals apiary.Id

                            where
                                forageProfile.Id
                                    == forageProfileId
                                &&
                                apiary.OwnerBeekeeperId
                                    == beekeeperId

                            select new {
                                forageProfile.Id,
                                forageProfile.Name
                            }
                        )
                        .SingleOrDefaultAsync(
                            cancellationToken);

                    if (profile is null) {
                        return Results.NotFound();
                    }

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

                        where
                            observation
                                .ObservedByBeekeeperId
                            == beekeeperId
                            &&
                            observation.ForageProfileId
                            == forageProfileId

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
                                profile.Name,
                                observation.ImagePath == null
                                    ? null
                                    : "/uploads/" + observation.ImagePath,
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
                        new GetForageObservationsByProfileResponse(
                            profile.Id,
                            items,
                            request.Page,
                            request.PageSize,
                            hasMore);

                    return Results.Ok(response);
                });

        return endpoints;
    }
}
