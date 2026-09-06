using PcelarskiEDnevnik.Modules.BeekeeperProfiles.Domain;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class BeekeeperProfileTests {
    [Fact]
    public void Update_NormalizesOptionalTextAndSetsAuditTimestamp() {
        var profile = new BeekeeperProfile(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "  Ana  ",
            "  Petrović  ",
            "  HID-100  ",
            "  +381 60 123 4567  ",
            12345);

        profile.Update(
            "  Milica  ",
            "  Petrović  ",
            "   ",
            "  +381 64 987 6543  ",
            null);

        Assert.Equal("Milica", profile.FirstName);
        Assert.Equal("Petrović", profile.LastName);
        Assert.Null(profile.Hid);
        Assert.Equal("+381 64 987 6543", profile.Phone);
        Assert.Null(profile.AgriculturalHoldingNumber);
        Assert.NotNull(profile.UpdatedAtUtc);
    }
}
