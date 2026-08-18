namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class ApiaryLocation {
    private ApiaryLocation() {
    }

    private ApiaryLocation(
        Guid ownerBeekeeperId,
        string? name,
        decimal latitude,
        decimal longitude,
        int? altitudeMeters,
        string? cadastralParcelNumber,
        string? description) {
        if (ownerBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Owner beekeeper ID cannot be empty.",
                nameof(ownerBeekeeperId));
        }

        if (latitude is < -90 or > 90) {
            throw new ArgumentOutOfRangeException(
                nameof(latitude));
        }

        if (longitude is < -180 or > 180) {
            throw new ArgumentOutOfRangeException(
                nameof(longitude));
        }

        Id = Guid.NewGuid();

        OwnerBeekeeperId = ownerBeekeeperId;

        Name = NormalizeOptionalText(name);

        Latitude = latitude;
        Longitude = longitude;

        AltitudeMeters = altitudeMeters;

        CadastralParcelNumber =
            NormalizeOptionalText(
                cadastralParcelNumber);

        Description =
            NormalizeOptionalText(description);

        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid OwnerBeekeeperId { get; private set; }

    public string? Name { get; private set; }

    public decimal Latitude { get; private set; }

    public decimal Longitude { get; private set; }

    public int? AltitudeMeters { get; private set; }

    public string? CadastralParcelNumber { get; private set; }

    public string? Description { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public static ApiaryLocation Create(
        Guid ownerBeekeeperId,
        string? name,
        decimal latitude,
        decimal longitude,
        int? altitudeMeters = null,
        string? cadastralParcelNumber = null,
        string? description = null) {
        return new ApiaryLocation(
            ownerBeekeeperId,
            name,
            latitude,
            longitude,
            altitudeMeters,
            cadastralParcelNumber,
            description);
    }

    public void Update(
        string? name,
        decimal latitude,
        decimal longitude,
        int? altitudeMeters,
        string? cadastralParcelNumber,
        string? description) {
        if (latitude is < -90 or > 90) {
            throw new ArgumentOutOfRangeException(
                nameof(latitude));
        }

        if (longitude is < -180 or > 180) {
            throw new ArgumentOutOfRangeException(
                nameof(longitude));
        }

        Name = NormalizeOptionalText(name);

        Latitude = latitude;
        Longitude = longitude;

        AltitudeMeters = altitudeMeters;

        CadastralParcelNumber =
            NormalizeOptionalText(
                cadastralParcelNumber);

        Description =
            NormalizeOptionalText(description);

        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private static string? NormalizeOptionalText(
        string? value) {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}