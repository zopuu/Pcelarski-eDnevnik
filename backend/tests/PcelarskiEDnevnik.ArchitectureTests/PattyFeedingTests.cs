using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.Record;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class PattyFeedingTests {
    [Theory]
    [InlineData(500, 100, 500)]
    [InlineData(500, 150, 750)]
    [InlineData(500, 300, 1500)]
    public void CalculateMassG_ReturnsExpectedMass(
        int pattyMassG,
        int percentage,
        int expectedMassG) {
        var result =
            PattyFeedingCalculator
                .CalculateMassG(
                    pattyMassG,
                    percentage);

        Assert.Equal(
            expectedMassG,
            result);
    }

    [Fact]
    public void CalculateMassG_RoundsHalfGramAwayFromZero() {
        var result =
            PattyFeedingCalculator
                .CalculateMassG(
                    pattyMassG: 1,
                    percentage: 50);

        Assert.Equal(
            1,
            result);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(301)]
    public void CalculateMassG_RejectsInvalidPercentage(
        int percentage) {
        Assert.Throws<ArgumentOutOfRangeException>(
            () => PattyFeedingCalculator
                .CalculateMassG(
                    500,
                    percentage));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void CalculateMassG_RejectsInvalidPattyMass(
        int pattyMassG) {
        Assert.Throws<ArgumentOutOfRangeException>(
            () => PattyFeedingCalculator
                .CalculateMassG(
                    pattyMassG,
                    100));
    }

    [Fact]
    public void Create_PersistsHistoricalMassAndNormalizesManufacturer() {
        var action =
            PattyFeeding.Create(
                Guid.NewGuid(),
                DateTimeOffset.UtcNow,
                Guid.NewGuid(),
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                massG: 750,
                PattyType.PROTEIN,
                manufacturer: "  Bee Food  ");

        Assert.Equal(
            750,
            action.MassG);
        Assert.Equal(
            PattyType.PROTEIN,
            action.PattyType);
        Assert.Equal(
            "Bee Food",
            action.Manufacturer);
    }

    [Fact]
    public void RequestValidation_RejectsDuplicateHivesInvalidPercentageAndMass() {
        var hiveId =
            Guid.NewGuid();

        var request =
            new RecordPattyFeedingRequest {
                PerformedAt =
                    DateTimeOffset.UtcNow,
                PattyMassG =
                    0,
                PattyType =
                    PattyType.PROTEIN,
                Hives =
                [
                    new RecordPattyFeedingHiveRequest {
                        HiveId = hiveId,
                        Percentage = 0
                    },
                    new RecordPattyFeedingHiveRequest {
                        HiveId = hiveId,
                        Percentage = 301
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
                    "Patty mass must be positive.");
        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Hive IDs must be unique.");
        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Every percentage must be greater than zero and at most 300.");
    }

    [Fact]
    public void RequestValidation_RejectsInvalidPattyType() {
        var request =
            new RecordPattyFeedingRequest {
                PerformedAt =
                    DateTimeOffset.UtcNow,
                PattyMassG =
                    500,
                PattyType =
                    (PattyType)999,
                Hives =
                [
                    new RecordPattyFeedingHiveRequest {
                        HiveId = Guid.NewGuid(),
                        Percentage = 100
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
                    "Invalid patty type.");
    }
}
