namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class ApiaryLayoutPosition {
    private ApiaryLayoutPosition() {
    }

    private ApiaryLayoutPosition(
        Guid layoutId,
        Guid hiveId,
        int x,
        int y) {
        if (layoutId == Guid.Empty) {
            throw new ArgumentException(
                "Layout ID cannot be empty.",
                nameof(layoutId));
        }

        if (hiveId == Guid.Empty) {
            throw new ArgumentException(
                "Hive ID cannot be empty.",
                nameof(hiveId));
        }

        if (x < 0) {
            throw new ArgumentOutOfRangeException(nameof(x));
        }

        if (y < 0) {
            throw new ArgumentOutOfRangeException(nameof(y));
        }

        LayoutId = layoutId;
        HiveId = hiveId;
        X = x;
        Y = y;
    }

    public Guid LayoutId { get; private set; }

    public Guid HiveId { get; private set; }

    public int X { get; private set; }

    public int Y { get; private set; }

    public static ApiaryLayoutPosition Create(
        Guid layoutId,
        Guid hiveId,
        int x,
        int y) =>
        new(layoutId, hiveId, x, y);
}
