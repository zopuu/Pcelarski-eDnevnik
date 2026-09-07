using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.Record;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class SyrupFeedingTests {
    [Theory]
    [InlineData(1000, 100, 1000)]
    [InlineData(1000, 60, 600)]
    [InlineData(1500, 80, 1200)]
    public void CalculateQuantityMl_ReturnsExpectedQuantity(
        int feederCapacityMl,
        int fillPercentage,
        int expectedQuantityMl) {
        var result =
            SyrupFeedingCalculator
                .CalculateQuantityMl(
                    feederCapacityMl,
                    fillPercentage);

        Assert.Equal(
            expectedQuantityMl,
            result);
    }

    [Fact]
    public void CalculateQuantityMl_RoundsHalfMilliliterAwayFromZero() {
        var result =
            SyrupFeedingCalculator
                .CalculateQuantityMl(
                    feederCapacityMl: 1,
                    fillPercentage: 50);

        Assert.Equal(
            1,
            result);
    }

    [Fact]
    public void CalculateIngredientEstimate_ForSixteenLitersAtOneToOne_ReturnsTenKilogramsEach() {
        var result =
            SyrupFeedingCalculator
                .CalculateIngredientEstimate(
                    totalSyrupMl: 16000,
                    sugarParts: 1,
                    waterParts: 1);

        Assert.Equal(
            10m,
            result.EstimatedSugarKg);
        Assert.Equal(
            10m,
            result.EstimatedWaterKg);
    }

    [Fact]
    public void CalculateIngredientEstimate_SupportsCustomRatio() {
        var result =
            SyrupFeedingCalculator
                .CalculateIngredientEstimate(
                    totalSyrupMl: 8000,
                    sugarParts: 2,
                    waterParts: 1);

        Assert.Equal(
            6.667m,
            result.EstimatedSugarKg);
        Assert.Equal(
            3.333m,
            result.EstimatedWaterKg);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(101)]
    public void CalculateQuantityMl_RejectsInvalidPercentage(
        int fillPercentage) {
        Assert.Throws<ArgumentOutOfRangeException>(
            () => SyrupFeedingCalculator
                .CalculateQuantityMl(
                    1000,
                    fillPercentage));
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(-1, 1)]
    [InlineData(1, 0)]
    [InlineData(1, -1)]
    public void CalculateIngredientEstimate_RejectsInvalidRatio(
        int sugarParts,
        int waterParts) {
        Assert.Throws<ArgumentOutOfRangeException>(
            () => SyrupFeedingCalculator
                .CalculateIngredientEstimate(
                    1000,
                    sugarParts,
                    waterParts));
    }

    [Fact]
    public void Create_PersistsHistoricalQuantityAndNormalizesAdditives() {
        var action =
            SyrupFeeding.Create(
                Guid.NewGuid(),
                DateTimeOffset.UtcNow,
                Guid.NewGuid(),
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                quantityMl: 600,
                sugarParts: 1,
                waterParts: 1,
                additives: "  Vitamin C  ");

        Assert.Equal(
            600,
            action.QuantityMl);
        Assert.Equal(
            1m,
            action.SugarParts);
        Assert.Equal(
            1m,
            action.WaterParts);
        Assert.Equal(
            "Vitamin C",
            action.Additives);
    }

    [Fact]
    public void RequestValidation_RejectsDuplicateHivesAndInvalidFillPercentage() {
        var hiveId =
            Guid.NewGuid();

        var request =
            new RecordSyrupFeedingRequest {
                PerformedAt =
                    DateTimeOffset.UtcNow,
                SugarParts =
                    1,
                WaterParts =
                    1,
                Hives =
                [
                    new RecordSyrupFeedingHiveRequest {
                        HiveId = hiveId,
                        FillPercentage = 60
                    },
                    new RecordSyrupFeedingHiveRequest {
                        HiveId = hiveId,
                        FillPercentage = 0
                    }
                ]
            };

        var results =
            new List<ValidationResult>();

        var isValid =
            Validator.TryValidateObject(
                request,
                new ValidationContext(
                    request),
                results,
                validateAllProperties: true);

        Assert.False(isValid);
        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Hive IDs must be unique.");
        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Every fill percentage must be greater than zero and at most 100.");
    }
}
