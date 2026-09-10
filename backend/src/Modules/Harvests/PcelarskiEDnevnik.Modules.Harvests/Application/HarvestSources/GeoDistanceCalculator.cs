namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal static class GeoDistanceCalculator {
    private const double EarthRadiusMeters =
        6_371_008.8;

    public static double DistanceMeters(
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

        var deltaLatitude =
            DegreesToRadians(
                (double)(
                    latitude2 -
                    latitude1));

        var deltaLongitude =
            DegreesToRadians(
                (double)(
                    longitude2 -
                    longitude1));

        var a =
            Math.Sin(
                deltaLatitude / 2) *
            Math.Sin(
                deltaLatitude / 2)
            +
            Math.Cos(lat1) *
            Math.Cos(lat2) *
            Math.Sin(
                deltaLongitude / 2) *
            Math.Sin(
                deltaLongitude / 2);

        var c =
            2 *
            Math.Atan2(
                Math.Sqrt(a),
                Math.Sqrt(1 - a));

        return EarthRadiusMeters * c;
    }

    private static double DegreesToRadians(
        double degrees) {
        return degrees *
               Math.PI /
               180d;
    }
}