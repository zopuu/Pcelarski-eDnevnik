namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class ApiaryStay {
    private ApiaryStay() {
    }

    private ApiaryStay(
        Guid apiaryId,
        Guid locationId,
        DateTimeOffset startedAtUtc,
        DateTimeOffset? endedAtUtc,
        HiveEntranceOrientation? orientation,
        string? note) {
        if (apiaryId == Guid.Empty) {
            throw new ArgumentException(
                "Apiary ID cannot be empty.",
                nameof(apiaryId));
        }

        if (locationId == Guid.Empty) {
            throw new ArgumentException(
                "Location ID cannot be empty.",
                nameof(locationId));
        }

        if (endedAtUtc.HasValue &&
            endedAtUtc.Value <= startedAtUtc) {
            throw new ArgumentException(
                "End date must be after start date.");
        }

        Id = Guid.NewGuid();

        ApiaryId = apiaryId;
        LocationId = locationId;

        StartedAtUtc = startedAtUtc;
        EndedAtUtc = endedAtUtc;

        Orientation = orientation;
        Note = NormalizeOptionalText(note);

        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid ApiaryId { get; private set; }

    public Guid LocationId { get; private set; }

    public DateTimeOffset StartedAtUtc { get; private set; }

    public DateTimeOffset? EndedAtUtc { get; private set; }

    public HiveEntranceOrientation? Orientation { get; private set; }

    public string? Note { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public bool IsActive =>
        EndedAtUtc is null;

    public static ApiaryStay Create(
        Guid apiaryId,
        Guid locationId,
        DateTimeOffset startedAtUtc,
        DateTimeOffset? endedAtUtc = null,
        HiveEntranceOrientation? orientation = null,
        string? note = null) {
        return new ApiaryStay(
            apiaryId,
            locationId,
            startedAtUtc,
            endedAtUtc,
            orientation,
            note);
    }

    public void Update(
        Guid locationId,
        DateTimeOffset startedAtUtc,
        DateTimeOffset? endedAtUtc,
        HiveEntranceOrientation? orientation,
        string? note) {
        if (locationId == Guid.Empty) {
            throw new ArgumentException(
                "Location ID cannot be empty.",
                nameof(locationId));
        }

        if (endedAtUtc.HasValue &&
            endedAtUtc.Value <= startedAtUtc) {
            throw new ArgumentException(
                "End date must be after start date.");
        }

        LocationId = locationId;
        StartedAtUtc = startedAtUtc;
        EndedAtUtc = endedAtUtc;

        Orientation = orientation;

        Note = NormalizeOptionalText(note);

        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private static string? NormalizeOptionalText(
        string? value) {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
    public void UpdateOrientation(
    HiveEntranceOrientation? orientation) {
        Orientation = orientation;

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }
}