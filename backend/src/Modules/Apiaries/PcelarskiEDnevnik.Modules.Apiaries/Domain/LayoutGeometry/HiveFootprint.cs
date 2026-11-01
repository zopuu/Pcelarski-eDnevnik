namespace PcelarskiEDnevnik.Modules.Apiaries.Domain.LayoutGeometry;

public sealed record HiveFootprint {
    public HiveFootprint(int width, int height) {
        if (width <= 0) {
            throw new ArgumentOutOfRangeException(nameof(width));
        }

        if (height <= 0) {
            throw new ArgumentOutOfRangeException(nameof(height));
        }

        Width = width;
        Height = height;
    }

    public int Width { get; }

    public int Height { get; }
}
