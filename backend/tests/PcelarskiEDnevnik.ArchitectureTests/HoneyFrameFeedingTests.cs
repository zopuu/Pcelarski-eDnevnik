using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Features.HoneyFrameFeedings.Record;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class HoneyFrameFeedingTests {
    [Fact]
    public async Task Record_ValidSingleHive_PersistsOneUngroupedAction() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var hive =
            CreateHive(
                beekeeperId,
                "Hive A");

        dbContext.Hives.Add(hive);
        await dbContext.SaveChangesAsync();

        var result =
            await RecordHoneyFrameFeedingEndpoint
                .HandleAsync(
                    CreateRequest(
                        (hive.Id, 2)),
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<RecordHoneyFrameFeedingResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var action =
            Assert.Single(
                await dbContext.HoneyFrameFeedings
                    .AsNoTracking()
                    .ToListAsync());

        Assert.Equal(
            StatusCodes.Status201Created,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    result)
                .StatusCode);
        Assert.Null(response.ActionGroupId);
        Assert.Equal(1, response.AffectedHiveCount);
        Assert.Equal(2, response.TotalFrameCount);
        Assert.Equal(hive.Id, action.HiveId);
        Assert.Equal(beekeeperId, action.PerformedByBeekeeperId);
        Assert.Null(action.ActionGroupId);
        Assert.Equal(2, action.FrameCount);
        Assert.Equal("Own reserve", action.FrameSource);
    }

    [Fact]
    public async Task Record_ValidBulk_PersistsSeparateActionsWithSharedGroup() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var hives =
            new[] {
                CreateHive(beekeeperId, "Hive A"),
                CreateHive(beekeeperId, "Hive B"),
                CreateHive(beekeeperId, "Hive C")
            };

        dbContext.Hives.AddRange(hives);
        await dbContext.SaveChangesAsync();

        var result =
            await RecordHoneyFrameFeedingEndpoint
                .HandleAsync(
                    CreateRequest(
                        (hives[0].Id, 2),
                        (hives[1].Id, 1),
                        (hives[2].Id, 3)),
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<RecordHoneyFrameFeedingResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var actions =
            await dbContext.HoneyFrameFeedings
                .AsNoTracking()
                .OrderBy(
                    action =>
                        action.FrameCount)
                .ToListAsync();

        Assert.NotNull(response.ActionGroupId);
        Assert.Equal(3, response.AffectedHiveCount);
        Assert.Equal(3, actions.Count);
        Assert.All(
            actions,
            action =>
                Assert.Equal(
                    response.ActionGroupId,
                    action.ActionGroupId));
        Assert.Equal(
            [1, 2, 3],
            actions
                .Select(
                    action =>
                        action.FrameCount)
                .ToArray());
    }

    [Fact]
    public async Task Record_TotalFrameCount_ComesFromPersistedPerHiveValues() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var hives =
            new[] {
                CreateHive(beekeeperId, "Hive A"),
                CreateHive(beekeeperId, "Hive B"),
                CreateHive(beekeeperId, "Hive C")
            };

        dbContext.Hives.AddRange(hives);
        await dbContext.SaveChangesAsync();

        var result =
            await RecordHoneyFrameFeedingEndpoint
                .HandleAsync(
                    CreateRequest(
                        (hives[0].Id, 2),
                        (hives[1].Id, 1),
                        (hives[2].Id, 3)),
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<RecordHoneyFrameFeedingResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var persistedTotal =
            await dbContext.HoneyFrameFeedings
                .SumAsync(
                    action =>
                        action.FrameCount);

        Assert.Equal(6, persistedTotal);
        Assert.Equal(persistedTotal, response.TotalFrameCount);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void RequestValidation_RejectsNonPositiveFrameCount(
        int frameCount) {
        var results =
            Validate(
                CreateRequest(
                    (Guid.NewGuid(), frameCount)));

        Assert.Contains(
            results,
            result =>
                result.MemberNames.Contains(
                    nameof(RecordHoneyFrameFeedingRequest.Hives)));

        Assert.Throws<ArgumentOutOfRangeException>(
            () => HoneyFrameFeeding.Create(
                Guid.NewGuid(),
                DateTimeOffset.UtcNow,
                Guid.NewGuid(),
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                frameCount,
                frameSource: null));
    }

    [Fact]
    public void RequestAndDomain_RejectFrameCountAboveConfiguredMaximum() {
        var invalidFrameCount =
            HoneyFrameFeedingRules.MaximumFrameCount +
            1;

        var results =
            Validate(
                CreateRequest(
                    (Guid.NewGuid(), invalidFrameCount)));

        Assert.Contains(
            results,
            result =>
                result.MemberNames.Contains(
                    nameof(RecordHoneyFrameFeedingRequest.Hives)));

        Assert.Throws<ArgumentOutOfRangeException>(
            () => HoneyFrameFeeding.Create(
                Guid.NewGuid(),
                DateTimeOffset.UtcNow,
                Guid.NewGuid(),
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                invalidFrameCount,
                frameSource: null));
    }

    [Fact]
    public void RequestValidation_RejectsDuplicateHiveIds() {
        var hiveId =
            Guid.NewGuid();

        var results =
            Validate(
                CreateRequest(
                    (hiveId, 1),
                    (hiveId, 2)));

        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Hive IDs must be unique.");
    }

    [Fact]
    public void RequestValidation_RejectsTooLongFrameSource() {
        var frameSource =
            new string(
                'x',
                HoneyFrameFeedingRules
                    .FrameSourceMaxLength +
                1);

        var request =
            CreateRequest(
                (Guid.NewGuid(), 1)) with {
                FrameSource =
                    frameSource
            };

        var results =
            Validate(request);

        Assert.Contains(
            results,
            result =>
                result.MemberNames.Contains(
                    nameof(request.FrameSource)));

        Assert.Throws<ArgumentException>(
            () => HoneyFrameFeeding.Create(
                Guid.NewGuid(),
                DateTimeOffset.UtcNow,
                Guid.NewGuid(),
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                frameCount: 1,
                frameSource));
    }

    [Fact]
    public void RequestValidation_RejectsMissingHives() {
        var request =
            new RecordHoneyFrameFeedingRequest {
                PerformedAt =
                    DateTimeOffset.UtcNow,
                Hives =
                    []
            };

        var results =
            Validate(request);

        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "At least one hive must be selected.");
    }

    [Fact]
    public async Task Record_InaccessibleHive_ReturnsNotFoundWithoutPersistingActions() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var ownedHive =
            CreateHive(
                beekeeperId,
                "Owned hive");

        var otherHive =
            CreateHive(
                Guid.NewGuid(),
                "Other hive");

        dbContext.Hives.AddRange(
            ownedHive,
            otherHive);
        await dbContext.SaveChangesAsync();

        var result =
            await RecordHoneyFrameFeedingEndpoint
                .HandleAsync(
                    CreateRequest(
                        (ownedHive.Id, 2),
                        (otherHive.Id, 1)),
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        Assert.Equal(
            StatusCodes.Status404NotFound,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    result)
                .StatusCode);
        Assert.Empty(
            await dbContext.HoneyFrameFeedings
                .AsNoTracking()
                .ToListAsync());
    }

    private static HivesDbContext CreateDbContext() {
        var options =
            new DbContextOptionsBuilder<HivesDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid()
                        .ToString())
                .ConfigureWarnings(
                    warnings =>
                        warnings.Ignore(
                            InMemoryEventId
                                .TransactionIgnoredWarning))
                .Options;

        return new HivesDbContext(options);
    }

    private static Hive CreateHive(
        Guid ownerBeekeeperId,
        string label) {
        return Hive.Create(
            ownerBeekeeperId,
            label,
            HiveType.LangstrothRoot,
            identificationNumber: null,
            colorHex: null,
            manufactureDate: null,
            manufacturer: null,
            material: null,
            purchaseDate: null);
    }

    private static RecordHoneyFrameFeedingRequest CreateRequest(
        params (Guid HiveId, int FrameCount)[] hives) {
        return new RecordHoneyFrameFeedingRequest {
            PerformedAt =
                DateTimeOffset.UtcNow,
            FrameSource =
                "  Own reserve  ",
            Hives =
                hives
                    .Select(
                        hive =>
                            new RecordHoneyFrameFeedingHiveRequest {
                                HiveId = hive.HiveId,
                                FrameCount = hive.FrameCount
                            })
                    .ToList()
        };
    }

    private static IReadOnlyList<ValidationResult> Validate(
        RecordHoneyFrameFeedingRequest request) {
        var results =
            new List<ValidationResult>();

        Validator.TryValidateObject(
            request,
            new ValidationContext(
                request),
            results,
            validateAllProperties: true);

        return results;
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
