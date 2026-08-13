namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;

public sealed class BeekeeperProfile {
    private BeekeeperProfile() {
        // Required by EF Core.
    }

    public BeekeeperProfile(
        Guid id,
        Guid userId,
        string firstName,
        string lastName,
        string? hid = null,
        string? phone = null,
        int? agriculturalHoldingNumber = null) {
        Id = id;
        UserId = userId;
        FirstName = firstName;
        LastName = lastName;
        Hid = hid;
        Phone = phone;
        AgriculturalHoldingNumber = agriculturalHoldingNumber;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public string FirstName { get; private set; } = null!;

    public string LastName { get; private set; } = null!;

    public string? Hid { get; private set; }

    public string? Phone { get; private set; }

    public int? AgriculturalHoldingNumber { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public void Update(
        string firstName,
        string lastName,
        string? hid,
        string? phone,
        int? agriculturalHoldingNumber) {
        FirstName = firstName;
        LastName = lastName;
        Hid = hid;
        Phone = phone;
        AgriculturalHoldingNumber = agriculturalHoldingNumber;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}