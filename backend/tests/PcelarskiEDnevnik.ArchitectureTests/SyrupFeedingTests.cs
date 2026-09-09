using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;
using PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.Record;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

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

    [Fact]
    public async Task GetHistoryAndById_ReturnOwnedSyrupFeedingDetails() {
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
            SyrupFeeding.Create(
                hive.Id,
                DateTimeOffset.UtcNow,
                beekeeperId,
                actionGroupId: null,
                imageUrl: null,
                notes: "  Spring feeding.  ",
                quantityMl: 750,
                sugarParts: 2,
                waterParts: 1,
                additives: "  Vitamin C  ");

        dbContext.Hives.Add(
            hive);
        dbContext.SyrupFeedings.Add(
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
            HiveActionHistoryKind.SyrupFeeding,
            historyItem.Kind);
        Assert.Equal(
            750,
            historyItem.QuantityMl);
        Assert.Equal(
            2m,
            historyItem.SugarParts);
        Assert.Equal(
            1m,
            historyItem.WaterParts);

        var detailResult =
            await GetSyrupFeedingByIdEndpoint
                .HandleAsync(
                    hive.Id,
                    feeding.Id,
                    currentBeekeeper,
                    dbContext,
                    CancellationToken.None);

        var detail =
            Assert.IsType<SyrupFeedingDetailsResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        detailResult)
                    .Value);

        Assert.Equal(
            feeding.Id,
            detail.Id);
        Assert.Equal(
            750,
            detail.QuantityMl);
        Assert.Equal(
            2m,
            detail.SugarParts);
        Assert.Equal(
            1m,
            detail.WaterParts);
        Assert.Equal(
            "Vitamin C",
            detail.Additives);
        Assert.Equal(
            "Spring feeding.",
            detail.Notes);
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
