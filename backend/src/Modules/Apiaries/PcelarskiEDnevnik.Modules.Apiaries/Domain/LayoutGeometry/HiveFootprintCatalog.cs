namespace PcelarskiEDnevnik.Modules.Apiaries.Domain.LayoutGeometry;

public static class HiveFootprintCatalog {
    public const int StandardWidth = 80;

    public const int StandardHeight = 80;

    public static HiveFootprint Standard { get; } =
        new(StandardWidth, StandardHeight);

    // HiveType is supplied as contract metadata; every current type uses this marker.
    public static HiveFootprint Resolve(string? hiveType) => Standard;
}
