using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Deactivate;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class ApiaryDeactivationTests {
    [Fact]
    public async Task Deactivate_ClosesStaysWithoutChangingHiveOrColonyState() {
        var beekeeperId = Guid.NewGuid();
        var apiary = CreateApiary(beekeeperId);
        var otherApiary = CreateApiary(beekeeperId);
        var startedAtUtc = DateTimeOffset.UtcNow.AddDays(-1);
        var apiaryStay = ApiaryStay.Create(
            apiary.Id,
            Guid.NewGuid(),
            startedAtUtc);
        var firstHive = CreateHive(beekeeperId, "Hive A");
        var secondHive = CreateHive(beekeeperId, "Hive B");
        var otherHive = CreateHive(beekeeperId, "Hive C");
        var firstHiveStay = HiveStay.Create(
            firstHive.Id,
            apiary.Id,
            startedAtUtc);
        var secondHiveStay = HiveStay.Create(
            secondHive.Id,
            apiary.Id,
            startedAtUtc.AddHours(1));
        var otherHiveStay = HiveStay.Create(
            otherHive.Id,
            otherApiary.Id,
            startedAtUtc);
        var colony = Colony.Create(
            beekeeperId,
            origin: null,
            formedOn: null,
            notes: null);
        var colonyStay = ColonyStay.Start(
            colony.Id,
            firstHive.Id,
            DateOnly.FromDateTime(startedAtUtc.UtcDateTime),
            notes: null);
        var queen = Queen.Create(
            beekeeperId,
            markingColorHex: null,
            origin: QueenOrigin.Unknown,
            breeder: null,
            breed: null,
            emergedOn: null,
            acquiredOn: null,
            notes: null);
        var queenStay = QueenStay.Start(
            queen.Id,
            colony.Id,
            DateOnly.FromDateTime(startedAtUtc.UtcDateTime),
            introductionMethod: QueenIntroductionMethod.Unknown,
            introductionOutcome: null,
            notes: null);

        await using var apiariesDbContext = CreateApiariesDbContext();
        await using var hivesDbContext = CreateHivesDbContext();

        apiariesDbContext.AddRange(apiary, otherApiary, apiaryStay);
        hivesDbContext.AddRange(
            firstHive,
            secondHive,
            otherHive,
            firstHiveStay,
            secondHiveStay,
            otherHiveStay,
            colony,
            colonyStay,
            queen,
            queenStay);

        await apiariesDbContext.SaveChangesAsync();
        await hivesDbContext.SaveChangesAsync();

        var handler = CreateHandler(
            beekeeperId,
            apiariesDbContext,
            new ApiaryHiveStayManager(
                apiariesDbContext,
                hivesDbContext));

        var result = await handler.HandleAsync(
            new DeactivateApiaryCommand(apiary.Id),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(ApiaryStatus.Inactive, apiary.Status);
        Assert.Equal(result.DeactivatedAtUtc, apiary.UpdatedAtUtc);
        Assert.Equal(result.DeactivatedAtUtc, apiaryStay.EndedAtUtc);
        Assert.Equal(result.DeactivatedAtUtc, firstHiveStay.EndedAtUtc);
        Assert.Equal(result.DeactivatedAtUtc, secondHiveStay.EndedAtUtc);
        Assert.Equal(HiveStatus.Active, firstHive.Status);
        Assert.Equal(HiveStatus.Active, secondHive.Status);
        Assert.Null(firstHive.UpdatedAtUtc);
        Assert.Null(secondHive.UpdatedAtUtc);
        Assert.Null(colonyStay.EndedOn);
        Assert.Null(queenStay.EndedOn);
        Assert.Equal(ColonyStatus.Active, colony.Status);
        Assert.Equal(QueenStatus.Active, queen.Status);
        Assert.Equal(HiveStatus.Active, otherHive.Status);
        Assert.Null(otherHiveStay.EndedAtUtc);
        Assert.Equal(ApiaryStatus.Active, otherApiary.Status);
    }

    [Fact]
    public async Task Deactivate_ForAnotherOwner_DoesNotChangeApiaryOrHiveStay() {
        var beekeeperId = Guid.NewGuid();
        var apiary = CreateApiary(beekeeperId);
        var hive = CreateHive(beekeeperId, "Hive A");
        var apiaryStay = ApiaryStay.Create(
            apiary.Id,
            Guid.NewGuid(),
            DateTimeOffset.UtcNow.AddDays(-1));
        var hiveStay = HiveStay.Create(
            hive.Id,
            apiary.Id,
            DateTimeOffset.UtcNow.AddDays(-1));

        await using var apiariesDbContext = CreateApiariesDbContext();
        await using var hivesDbContext = CreateHivesDbContext();

        apiariesDbContext.AddRange(apiary, apiaryStay);
        hivesDbContext.AddRange(hive, hiveStay);

        await apiariesDbContext.SaveChangesAsync();
        await hivesDbContext.SaveChangesAsync();

        var handler = CreateHandler(
            Guid.NewGuid(),
            apiariesDbContext,
            new ApiaryHiveStayManager(
                apiariesDbContext,
                hivesDbContext));

        var result = await handler.HandleAsync(
            new DeactivateApiaryCommand(apiary.Id),
            CancellationToken.None);

        Assert.Null(result);
        Assert.Equal(ApiaryStatus.Active, apiary.Status);
        Assert.Null(apiaryStay.EndedAtUtc);
        Assert.Equal(HiveStatus.Active, hive.Status);
        Assert.Null(hiveStay.EndedAtUtc);
    }

    [Fact]
    public async Task Deactivate_WhenHiveStayPersistenceFails_DoesNotPersistApiaryChanges() {
        var beekeeperId = Guid.NewGuid();
        var apiary = CreateApiary(beekeeperId);
        var apiaryStay = ApiaryStay.Create(
            apiary.Id,
            Guid.NewGuid(),
            DateTimeOffset.UtcNow.AddDays(-1));
        var options = CreateApiariesDbContextOptions();

        await using (var arrangeContext = new ApiariesDbContext(options)) {
            arrangeContext.AddRange(apiary, apiaryStay);
            await arrangeContext.SaveChangesAsync();
        }

        await using (var actContext = new ApiariesDbContext(options)) {
            var handler = CreateHandler(
                beekeeperId,
                actContext,
                new FailingApiaryHiveStayManager());

            await Assert.ThrowsAsync<DbUpdateException>(
                () => handler.HandleAsync(
                    new DeactivateApiaryCommand(apiary.Id),
                    CancellationToken.None));
        }

        await using var assertContext = new ApiariesDbContext(options);
        var persistedApiary =
            await assertContext.Apiaries.SingleAsync(
                x => x.Id == apiary.Id);
        var persistedStay =
            await assertContext.ApiaryStays.SingleAsync(
                x => x.Id == apiaryStay.Id);

        Assert.Equal(ApiaryStatus.Active, persistedApiary.Status);
        Assert.Null(persistedApiary.UpdatedAtUtc);
        Assert.Null(persistedStay.EndedAtUtc);
    }

    private static DeactivateApiaryHandler CreateHandler(
        Guid beekeeperId,
        ApiariesDbContext dbContext,
        IApiaryHiveStayManager hiveStayManager) {
        return new DeactivateApiaryHandler(
            new TestCurrentBeekeeperContext(beekeeperId),
            dbContext,
            hiveStayManager);
    }

    private static Apiary CreateApiary(Guid beekeeperId) {
        return Apiary.Create(
            beekeeperId,
            $"Apiary {Guid.NewGuid()}",
            ApiaryType.Stationary,
            status: ApiaryStatus.Active);
    }

    private static Hive CreateHive(
        Guid beekeeperId,
        string label) {
        return Hive.Create(
            beekeeperId,
            label,
            HiveType.LangstrothRoot,
            identificationNumber: null,
            colorHex: null,
            manufactureDate: null,
            manufacturer: null,
            material: null,
            purchaseDate: null);
    }

    private static ApiariesDbContext CreateApiariesDbContext() {
        return new ApiariesDbContext(
            CreateApiariesDbContextOptions());
    }

    private static DbContextOptions<ApiariesDbContext>
        CreateApiariesDbContextOptions() {
        return new DbContextOptionsBuilder<ApiariesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
    }

    private static HivesDbContext CreateHivesDbContext() {
        var options =
            new DbContextOptionsBuilder<HivesDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

        return new HivesDbContext(options);
    }

    private sealed class TestCurrentBeekeeperContext(
        Guid beekeeperId)
        : ICurrentBeekeeperContext {
        public Task<Guid> GetBeekeeperIdAsync(
            CancellationToken cancellationToken = default) {
            return Task.FromResult(beekeeperId);
        }
    }

    private sealed class FailingApiaryHiveStayManager
        : IApiaryHiveStayManager {
        public Task EndActiveHiveStaysAsync(
            Guid apiaryId,
            Guid beekeeperId,
            DateTimeOffset endedAtUtc,
            CancellationToken cancellationToken) {
            throw new DbUpdateException(
                "Simulated hive-stay persistence failure.");
        }
    }
}
