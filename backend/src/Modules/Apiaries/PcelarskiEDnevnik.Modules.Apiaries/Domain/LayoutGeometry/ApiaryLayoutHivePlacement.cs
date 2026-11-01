namespace PcelarskiEDnevnik.Modules.Apiaries.Domain.LayoutGeometry;

public sealed record ApiaryLayoutHivePlacement {
    public ApiaryLayoutHivePlacement(
        Guid hiveId,
        int x,
        int y,
        HiveFootprint footprint) {
        if (hiveId == Guid.Empty) {
            throw new ArgumentException(
                "Hive ID cannot be empty.",
                nameof(hiveId));
        }

        ArgumentNullException.ThrowIfNull(footprint);

        HiveId = hiveId;
        X = x;
        Y = y;
        Footprint = footprint;
    }

    public Guid HiveId { get; }

    public int X { get; }

    public int Y { get; }

    public HiveFootprint Footprint { get; }
}
