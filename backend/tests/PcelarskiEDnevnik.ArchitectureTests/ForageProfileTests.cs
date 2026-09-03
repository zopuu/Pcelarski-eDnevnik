using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class ForageProfileTests {
    [Fact]
    public void Create_AddsOtherForTheMissingPercentage() {
        var profile =
            ForageProfile.Create(
                2026,
                3,
                "Rana prolećna paša",
                null,
                Guid.NewGuid(),
                [
                    new ForageProfileItemInput(
                        ForageType.Acacia,
                        70.00m,
                        5,
                        null),
                    new ForageProfileItemInput(
                        ForageType.Forest,
                        20.00m,
                        3,
                        null)
                ]);

        Assert.Equal(100.00m, profile.Items.Sum(x => x.Percentage));

        var other = Assert.Single(
            profile.Items,
            x => x.ForageType == ForageType.Other);

        Assert.Equal(10.00m, other.Percentage);
        Assert.Equal(
            ForageProfileRules.OtherDefaultIntensity,
            other.Intensity);
    }

    [Fact]
    public void Create_AddsOtherWhenNoItemsAreSubmitted() {
        var profile =
            ForageProfile.Create(
                2026,
                null,
                "Nepoznata paša",
                null,
                Guid.NewGuid(),
                []);

        var other = Assert.Single(profile.Items);

        Assert.Equal(ForageType.Other, other.ForageType);
        Assert.Equal(100.00m, other.Percentage);
    }

    [Fact]
    public void Create_DoesNotAddOtherWhenItemsAlreadyTotalOneHundredPercent() {
        var profile =
            ForageProfile.Create(
                2026,
                null,
                "Letnja paša",
                null,
                Guid.NewGuid(),
                [
                    new ForageProfileItemInput(
                        ForageType.Sunflower,
                        100.00m,
                        4,
                        null)
                ]);

        Assert.DoesNotContain(
            profile.Items,
            x => x.ForageType == ForageType.Other);
    }

    [Fact]
    public void Create_RejectsAClientSuppliedOtherItem() {
        Assert.Throws<ArgumentException>(
            () => ForageProfile.Create(
                2026,
                null,
                "Letnja paša",
                null,
                Guid.NewGuid(),
                [
                    new ForageProfileItemInput(
                        ForageType.Other,
                        100.00m,
                        1,
                        null)
                ]));
    }

    [Fact]
    public void Create_RejectsItemsWhoseTotalExceedsOneHundredPercent() {
        Assert.Throws<ArgumentException>(
            () => ForageProfile.Create(
                2026,
                null,
                "Letnja paša",
                null,
                Guid.NewGuid(),
                [
                    new ForageProfileItemInput(
                        ForageType.Sunflower,
                        70.00m,
                        4,
                        null),
                    new ForageProfileItemInput(
                        ForageType.Forest,
                        40.01m,
                        3,
                        null)
                ]));
    }
}
