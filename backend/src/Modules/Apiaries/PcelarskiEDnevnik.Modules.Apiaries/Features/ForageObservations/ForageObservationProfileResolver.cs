using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

namespace PcelarskiEDnevnik.Modules.Apiaries
    .Features.ForageObservations;

internal static class
    ForageObservationProfileResolver {
    private const double EarthRadiusKm =
        6371.0088;

    public static async Task<Guid?>
        ResolveAsync(
            Guid beekeeperId,
            decimal latitude,
            decimal longitude,
            DateTimeOffset observedAt,
            ApiariesDbContext dbContext,
            CancellationToken cancellationToken) {
        var year =
            observedAt.Year;

        var locations =
            dbContext
                .Set<ApiaryLocation>()
                .AsNoTracking();

        var candidates =
            await (
                from profile
                    in dbContext
                        .ForageProfiles
                        .AsNoTracking()

                join stay
                    in dbContext
                        .ApiaryStays
                        .AsNoTracking()
                    on profile.ApiaryStayId
                    equals stay.Id

                join apiary
                    in dbContext
                        .Apiaries
                        .AsNoTracking()
                    on stay.ApiaryId
                    equals apiary.Id

                join location
                    in locations
                    on stay.LocationId
                    equals location.Id

                where
                    apiary.OwnerBeekeeperId
                        == beekeeperId
                    &&
                    stay.EndedAtUtc == null
                    &&
                    stay.StartedAtUtc
                        <= observedAt
                    &&
                    profile.Year == year
                    &&
                    profile.RadiusKm != null

                select new Candidate(
                    profile.Id,
                    profile.RadiusKm!.Value,
                    location.Latitude,
                    location.Longitude)
            )
            .ToListAsync(
                cancellationToken);

        return candidates
            .Select(
                candidate =>
                    new {
                        candidate.ProfileId,
                        candidate.RadiusKm,
                        DistanceKm =
                            CalculateDistanceKm(
                                latitude,
                                longitude,
                                candidate.Latitude,
                                candidate.Longitude)
                    })
            .Where(
                x =>
                    x.DistanceKm
                    <= x.RadiusKm)
            .OrderBy(x => x.DistanceKm)
            .ThenBy(x => x.ProfileId)
            .Select(
                x => (Guid?)x.ProfileId)
            .FirstOrDefault();
    }

    private static double CalculateDistanceKm(
        decimal latitude1,
        decimal longitude1,
        decimal latitude2,
        decimal longitude2) {
        var lat1 =
            DegreesToRadians(
                (double)latitude1);

        var lat2 =
            DegreesToRadians(
                (double)latitude2);

        var deltaLat =
            DegreesToRadians(
                (double)(
                    latitude2 -
                    latitude1));

        var deltaLon =
            DegreesToRadians(
                (double)(
                    longitude2 -
                    longitude1));

        var a =
            Math.Sin(deltaLat / 2)
            * Math.Sin(deltaLat / 2)
            +
            Math.Cos(lat1)
            * Math.Cos(lat2)
            * Math.Sin(deltaLon / 2)
            * Math.Sin(deltaLon / 2);

        var c =
            2
            * Math.Atan2(
                Math.Sqrt(a),
                Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    private static double DegreesToRadians(
        double degrees) {
        return degrees
               * Math.PI
               / 180.0;
    }

    private sealed record Candidate(
        Guid ProfileId,
        short RadiusKm,
        decimal Latitude,
        decimal Longitude);
}