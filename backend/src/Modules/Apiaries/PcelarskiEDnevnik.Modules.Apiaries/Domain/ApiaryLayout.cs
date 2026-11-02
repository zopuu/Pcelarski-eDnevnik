namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class ApiaryLayout {
    private readonly List<ApiaryLayoutPosition> _positions = [];

    private ApiaryLayout() {
    }

    private ApiaryLayout(Guid apiaryStayId) {
        if (apiaryStayId == Guid.Empty) {
            throw new ArgumentException(
                "Apiary stay ID cannot be empty.",
                nameof(apiaryStayId));
        }

        Id = Guid.NewGuid();
        ApiaryStayId = apiaryStayId;
        Version = 1;
        CreatedAtUtc = DateTimeOffset.UtcNow;
        UpdatedAtUtc = CreatedAtUtc;
    }

    public Guid Id { get; private set; }

    public Guid ApiaryStayId { get; private set; }

    public long Version { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public IReadOnlyCollection<ApiaryLayoutPosition> Positions =>
        _positions.AsReadOnly();

    public static ApiaryLayout Create(Guid apiaryStayId) =>
        new(apiaryStayId);

    // The caller must validate active membership and geometry before replacing positions.
    public void ReplacePositions(
        IReadOnlyCollection<(Guid HiveId, int X, int Y)> positions) {
        ArgumentNullException.ThrowIfNull(positions);

        if (positions.Any(position =>
                position.HiveId == Guid.Empty || position.X < 0 || position.Y < 0) ||
            positions.Select(position => position.HiveId).Distinct().Count() != positions.Count) {
            throw new ArgumentException("Invalid layout positions.", nameof(positions));
        }

        var desired = positions.ToDictionary(position => position.HiveId);
        _positions.RemoveAll(position => !desired.ContainsKey(position.HiveId));

        foreach (var position in _positions) {
            var target = desired[position.HiveId];
            position.MoveTo(target.X, target.Y);
        }

        var existingIds = _positions.Select(position => position.HiveId).ToHashSet();
        foreach (var position in positions.Where(position => !existingIds.Contains(position.HiveId))) {
            _positions.Add(ApiaryLayoutPosition.Create(
                Id, position.HiveId, position.X, position.Y));
        }

        Version = checked(Version + 1);
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}
