using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.GetCurrent;

public static class GetCurrentForageProfileEndpoint {
    public static IEndpointRouteBuilder MapGetCurrentForageProfileEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/",
            async (
                Guid apiaryId,
                int? year,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(cancellationToken);

                    var availableYears =
                        await (
                            from profile in dbContext.ForageProfiles.AsNoTracking()

                            join stay in dbContext.ApiaryStays.AsNoTracking()
                                on profile.ApiaryStayId equals stay.Id

                            join apiary in dbContext.Apiaries.AsNoTracking()
                                on stay.ApiaryId equals apiary.Id

                            where
                                stay.ApiaryId == apiaryId &&
                                stay.EndedAtUtc == null &&
                                apiary.OwnerBeekeeperId == beekeeperId

                            orderby profile.Year descending

                            select profile.Year
                        )
                        .ToListAsync(cancellationToken);

                    if (availableYears.Count == 0) {
                        return Results.NotFound();
                    }

                    var selectedYear =
                        year ?? availableYears[0];

                    if (!availableYears.Contains(selectedYear)) {
                        return Results.NotFound();
                    }

                    var currentProfile =
                        await (
                            from profile in dbContext.ForageProfiles.AsNoTracking()

                            join stay in dbContext.ApiaryStays.AsNoTracking()
                                on profile.ApiaryStayId equals stay.Id

                            join apiary in dbContext.Apiaries.AsNoTracking()
                                on stay.ApiaryId equals apiary.Id

                            where
                                stay.ApiaryId == apiaryId &&
                                stay.EndedAtUtc == null &&
                                apiary.OwnerBeekeeperId == beekeeperId &&
                                profile.Year == selectedYear

                            select new ForageProfileResponse(
                                profile.Id,
                                profile.Year,
                                profile.RadiusKm,
                                profile.Name,
                                profile.Notes,
                                profile.IsLocked,
                                profile.ApiaryStayId,
                                profile.Items
                                    .OrderBy(x => x.ForageType)
                                    .Select(
                                        x => new ForageProfileItemResponse(
                                            x.Id,
                                            x.ForageType,
                                            x.Percentage,
                                            x.Intensity,
                                            x.Notes))
                                    .ToList())
                        )
                        .SingleOrDefaultAsync(cancellationToken);

                    if (currentProfile is null) {
                        return Results.NotFound();
                    }

                    return Results.Ok(
                        currentProfile with {
                            AvailableYears = availableYears,
                        });
                });

        return endpoints;
    }
}
