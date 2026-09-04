namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class ForageObservation {
    private ForageObservation() {
    }

    private ForageObservation(
        Guid observedByBeekeeperId,
        DateTimeOffset observedAt,
        ForageType forageType,
        short intensity,
        string? notes,
        Guid locationId,
        Guid? forageProfileId) {
        Validate(
            observedByBeekeeperId,
            forageType,
            intensity,
            locationId);

        Id = Guid.NewGuid();

        ObservedByBeekeeperId =
            observedByBeekeeperId;

        ObservedAt = observedAt;
        ForageType = forageType;
        Intensity = intensity;

        Notes =
            NormalizeOptionalText(notes);

        LocationId = locationId;
        ForageProfileId = forageProfileId;

        CreatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid ObservedByBeekeeperId {
        get;
        private set;
    }

    public DateTimeOffset ObservedAt {
        get;
        private set;
    }

    public ForageType ForageType {
        get;
        private set;
    }

    public short Intensity {
        get;
        private set;
    }

    public string? Notes {
        get;
        private set;
    }

    public Guid LocationId {
        get;
        private set;
    }

    public Guid? ForageProfileId {
        get;
        private set;
    }

    public DateTimeOffset CreatedAtUtc {
        get;
        private set;
    }

    public DateTimeOffset? UpdatedAtUtc {
        get;
        private set;
    }

    public static ForageObservation Create(
        Guid observedByBeekeeperId,
        DateTimeOffset observedAt,
        ForageType forageType,
        short intensity,
        string? notes,
        Guid locationId,
        Guid? forageProfileId) {
        return new ForageObservation(
            observedByBeekeeperId,
            observedAt,
            forageType,
            intensity,
            notes,
            locationId,
            forageProfileId);
    }

    public void Update(
        DateTimeOffset observedAt,
        ForageType forageType,
        short intensity,
        string? notes,
        Guid? forageProfileId) {
        Validate(
            ObservedByBeekeeperId,
            forageType,
            intensity,
            LocationId);

        ObservedAt = observedAt;
        ForageType = forageType;
        Intensity = intensity;

        Notes =
            NormalizeOptionalText(notes);

        ForageProfileId =
            forageProfileId;

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    private static void Validate(
        Guid observedByBeekeeperId,
        ForageType forageType,
        short intensity,
        Guid locationId) {
        if (observedByBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Observed-by beekeeper ID cannot be empty.",
                nameof(observedByBeekeeperId));
        }

        if (locationId == Guid.Empty) {
            throw new ArgumentException(
                "Location ID cannot be empty.",
                nameof(locationId));
        }

        if (!Enum.IsDefined(forageType)) {
            throw new ArgumentOutOfRangeException(
                nameof(forageType));
        }

        if (intensity is
            < ForageObservationRules.IntensityMin
            or
            > ForageObservationRules.IntensityMax) {
            throw new ArgumentOutOfRangeException(
                nameof(intensity));
        }
    }

    private static string? NormalizeOptionalText(
        string? value) {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}