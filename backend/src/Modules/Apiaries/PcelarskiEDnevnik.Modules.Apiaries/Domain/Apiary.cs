using System.Net.NetworkInformation;

namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class Apiary {
    private Apiary() {
    }

    private Apiary(
    Guid ownerBeekeeperId,
    string name,
    ApiaryType type,
    string? identificationNumber,
    ApiaryStatus? status,
    string? imagePath = null) {
        if (ownerBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Owner beekeeper ID cannot be empty.",
                nameof(ownerBeekeeperId));
        }

        Id = Guid.NewGuid();

        OwnerBeekeeperId = ownerBeekeeperId;

        IdentificationNumber =
            NormalizeOptionalText(
                identificationNumber);

        Name = NormalizeRequiredName(name);

        Type = ValidateType(type);
        Status = status;
        ImagePath = NormalizeOptionalText(imagePath);

        CreatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid OwnerBeekeeperId { get; private set; }

    public string? IdentificationNumber { get; private set; }

    public string Name { get; private set; } = null!;

    public ApiaryType Type { get; private set; }

    public ApiaryStatus? Status { get; private set; }

    public string? ImagePath { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public static Apiary Create(
    Guid ownerBeekeeperId,
    string name,
    ApiaryType type,
    string? identificationNumber = null,
    ApiaryStatus? status = null,
    string? imagePath = null) {
        return new Apiary(
            ownerBeekeeperId,
            name,
            type,
            identificationNumber,
            status,
            imagePath);
    }
    public void Update(
    string? identificationNumber,
    string name,
    ApiaryType type) {
        IdentificationNumber = NormalizeOptionalText(identificationNumber);
        Name = NormalizeRequiredName(name);
        Type = ValidateType(type);
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void UpdateImagePath(string? imagePath) {
        ImagePath = NormalizeOptionalText(imagePath);
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void Deactivate(
        DateTimeOffset deactivatedAtUtc) {
        if (Status == ApiaryStatus.Inactive) {
            throw new InvalidOperationException(
                "Apiary is already inactive.");
        }

        Status = ApiaryStatus.Inactive;
        UpdatedAtUtc = deactivatedAtUtc;
    }

    private static string? NormalizeOptionalText(
    string? value) {
        if (string.IsNullOrWhiteSpace(value)) {
            return null;
        }

        return value.Trim();
    }

    private static ApiaryType ValidateType(
        ApiaryType type) {
        if (!Enum.IsDefined(type)) {
            throw new ArgumentOutOfRangeException(
                nameof(type),
                type,
                "Apiary type must be Stationary or Migratory.");
        }

        return type;
    }

    private static string NormalizeRequiredName(
        string name) {
        if (string.IsNullOrWhiteSpace(name)) {
            throw new ArgumentException(
                "Apiary name is required.",
                nameof(name));
        }

        return name.Trim();
    }
}
