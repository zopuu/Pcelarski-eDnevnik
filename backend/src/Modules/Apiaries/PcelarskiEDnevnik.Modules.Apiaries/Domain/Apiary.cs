using System.Net.NetworkInformation;

namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class Apiary {
    private Apiary() {
    }

    private Apiary(
        Guid ownerBeekeeperId,
        string? identificationNumber,
        string? name,
        ApiaryType? type,
        ApiaryStatus? status) {
        if (ownerBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Owner beekeeper ID cannot be empty.",
                nameof(ownerBeekeeperId));
        }

        Id = Guid.NewGuid();
        OwnerBeekeeperId = ownerBeekeeperId;
        IdentificationNumber = identificationNumber;
        Name = name;
        Type = type;
        Status = status;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid OwnerBeekeeperId { get; private set; }

    public string? IdentificationNumber { get; private set; }

    public string? Name { get; private set; }

    public ApiaryType? Type { get; private set; }

    public ApiaryStatus? Status { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public static Apiary Create(                    // refractor to use normalization as update does
        Guid ownerBeekeeperId,
        string? identificationNumber = null,
        string? name = null,
        ApiaryType? type = null,
        ApiaryStatus? status = null) {
        return new Apiary(
            ownerBeekeeperId,
            identificationNumber,
            name,
            type,
            status);
    }
    public void Update(
    string? identificationNumber,
    string? name,
    ApiaryType? type,
    ApiaryStatus? status) {
        IdentificationNumber = NormalizeOptionalText(identificationNumber);
        Name = NormalizeOptionalText(name);
        Type = type;
        Status = status;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
    private static string? NormalizeOptionalText(
    string? value) {
        if (string.IsNullOrWhiteSpace(value)) {
            return null;
        }

        return value.Trim();
    }
}