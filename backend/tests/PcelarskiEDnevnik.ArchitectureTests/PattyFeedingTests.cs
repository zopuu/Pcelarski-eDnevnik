using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.PattyFeeding;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;
using PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.PattyFeedings.Record;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

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

    [Fact]
    public async Task GetHistoryAndById_ReturnOwnedPattyFeedingDetails() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var hive =
            Hive.Create(
                beekeeperId,
                "Hive A",
                HiveType.LangstrothRoot,
                identificationNumber: null,
                colorHex: null,
                manufactureDate: null,
                manufacturer: null,
                material: null,
                purchaseDate: null);

        var feeding =
            PattyFeeding.Create(
                hive.Id,
                DateTimeOffset.UtcNow,
                beekeeperId,
                actionGroupId: Guid.NewGuid(),
                imageUrl: null,
                notes: "  Spring feeding.  ",
                massG: 750,
                PattyType.PROTEIN,
                manufacturer: "  Bee Food  ");

        dbContext.Hives.Add(
            hive);
        dbContext.PattyFeedings.Add(
            feeding);
        await dbContext.SaveChangesAsync();

        var currentBeekeeper =
            new TestCurrentBeekeeperContext(
                beekeeperId);

        var historyResult =
            await GetHiveActionHistoryEndpoint
                .HandleAsync(
                    hive.Id,
                    currentBeekeeper,
                    dbContext,
                    CancellationToken.None);

        var history =
            Assert.IsType<HiveActionHistoryPageResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        historyResult)
                    .Value);

        var historyItem =
            Assert.Single(
                history.Items);

        Assert.Equal(
            HiveActionType.PattyFeeding,
            historyItem.Type);
        var summary =
            Assert.IsType<PattyFeedingHistorySummary>(
                historyItem.Summary);
        Assert.Equal(
            750,
            summary.MassG);
        Assert.Equal(
            PattyType.PROTEIN,
            summary.PattyType);
        Assert.Equal(
            "Bee Food",
            summary.Manufacturer);

        var detailResult =
            await GetPattyFeedingByIdEndpoint
                .HandleAsync(
                    hive.Id,
                    feeding.Id,
                    currentBeekeeper,
                    dbContext,
                    CancellationToken.None);

        var detail =
            Assert.IsType<PattyFeedingDetailsResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        detailResult)
                    .Value);

        Assert.Equal(
            feeding.Id,
            detail.Id);
        Assert.Equal(
            750,
            detail.MassG);
        Assert.Equal(
            PattyType.PROTEIN,
            detail.PattyType);
        Assert.Equal(
            "Bee Food",
            detail.Manufacturer);
        Assert.Equal(
            "Spring feeding.",
            detail.Notes);

        var otherBeekeeperResult =
            await GetPattyFeedingByIdEndpoint
                .HandleAsync(
                    hive.Id,
                    feeding.Id,
                    new TestCurrentBeekeeperContext(
                        Guid.NewGuid()),
                    dbContext,
                    CancellationToken.None);

        Assert.Equal(
            StatusCodes.Status404NotFound,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    otherBeekeeperResult)
                .StatusCode);
    }

    private static HivesDbContext CreateDbContext() {
        var options =
            new DbContextOptionsBuilder<HivesDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid()
                        .ToString())
                .Options;

        return new HivesDbContext(
            options);
    }

    private sealed class TestCurrentBeekeeperContext(
        Guid beekeeperId)
        : ICurrentBeekeeperContext {
        public Task<Guid> GetBeekeeperIdAsync(
            CancellationToken cancellationToken = default) {
            return Task.FromResult(
                beekeeperId);
        }
    }
}
