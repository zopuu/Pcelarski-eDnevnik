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
}
