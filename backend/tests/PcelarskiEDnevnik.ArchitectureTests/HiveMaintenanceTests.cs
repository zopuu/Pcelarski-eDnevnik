using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Record;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveMaintenance.Update;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class HiveMaintenanceTests {
    [Fact]
    public async Task Record_WithoutCost_PersistsOneUngroupedActionWithoutChangingHiveStatus() {
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
            await RecordHiveMaintenanceEndpoint
                .HandleAsync(
                    CreateRecordRequest(
                        hive.Id),
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<RecordHiveMaintenanceResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var maintenance =
            Assert.Single(
                await dbContext.HiveMaintenances
                    .AsNoTracking()
                    .ToListAsync());

        var persistedHive =
            await dbContext.Hives
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(
            StatusCodes.Status201Created,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    result)
                .StatusCode);
        Assert.Equal(
            maintenance.Id,
            response.ActionId);
        Assert.Equal(
            hive.Id,
            maintenance.HiveId);
        Assert.Equal(
            beekeeperId,
            maintenance.PerformedByBeekeeperId);
        Assert.Null(maintenance.ActionGroupId);
        Assert.Null(maintenance.CostAmount);
        Assert.Null(maintenance.CurrencyCode);
        Assert.Equal(
            HiveStatus.Active,
            persistedHive.Status);
        Assert.Equal(
            HiveStatus.Active,
            response.HiveStatus);
    }

    [Fact]
    public async Task Record_WithCost_NormalizesCurrencyAndServiceProvider() {
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

        var request =
            CreateRecordRequest(
                hive.Id) with {
                CostAmount = 2_500m,
                CurrencyCode = "  rsd  ",
                ServiceProvider = "  Api Servis  "
            };

        var result =
            await RecordHiveMaintenanceEndpoint
                .HandleAsync(
                    request,
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<RecordHiveMaintenanceResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var maintenance =
            await dbContext.HiveMaintenances
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(2_500m, response.CostAmount);
        Assert.Equal("RSD", response.CurrencyCode);
        Assert.Equal("Api Servis", response.ServiceProvider);
        Assert.Equal("RSD", maintenance.CurrencyCode);
        Assert.Equal("Api Servis", maintenance.ServiceProvider);
    }

    [Fact]
    public async Task Record_InaccessibleHive_ReturnsNotFoundWithoutChangingHiveOrPersistingMaintenance() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var otherHive =
            CreateHive(
                Guid.NewGuid(),
                "Other hive");

        dbContext.Hives.Add(otherHive);
        await dbContext.SaveChangesAsync();

        var result =
            await RecordHiveMaintenanceEndpoint
                .HandleAsync(
                    CreateRecordRequest(
                        otherHive.Id),
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
            await dbContext.HiveMaintenances
                .AsNoTracking()
                .ToListAsync());
        Assert.Equal(
            HiveStatus.Active,
            (await dbContext.Hives
                .AsNoTracking()
                .SingleAsync()).Status);
    }

    [Theory]
    [InlineData(2500, null)]
    [InlineData(null, "RSD")]
    public void RequestAndDomain_RejectMismatchedCostCurrencyPair(
        int? costAmount,
        string? currencyCode) {
        var request =
            CreateRecordRequest(
                Guid.NewGuid()) with {
                CostAmount = costAmount,
                CurrencyCode = currencyCode
            };

        var updateRequest =
            CreateUpdateRequest() with {
                CostAmount = costAmount,
                CurrencyCode = currencyCode
            };

        Assert.Contains(
            Validate(request),
            result =>
                result.ErrorMessage ==
                    "Cost amount and currency code must either both be provided or both be omitted.");
        Assert.Contains(
            Validate(updateRequest),
            result =>
                result.ErrorMessage ==
                    "Cost amount and currency code must either both be provided or both be omitted.");
        Assert.Throws<ArgumentException>(
            () => CreateDomainMaintenance(
                costAmount: costAmount,
                currencyCode: currencyCode));
    }

    [Fact]
    public void RequestAndDomain_RejectInvalidCostValues() {
        var invalidCosts =
            new[] {
                -0.01m,
                HiveMaintenanceRules
                    .MaximumCostAmount +
                    0.01m,
                1.001m
            };

        foreach (var invalidCost in
            invalidCosts) {
            var request =
                CreateRecordRequest(
                    Guid.NewGuid()) with {
                    CostAmount = invalidCost,
                    CurrencyCode = "RSD"
                };

            Assert.Contains(
                Validate(request),
                result =>
                    result.MemberNames.Contains(
                        nameof(request.CostAmount)));
            Assert.ThrowsAny<ArgumentException>(
                () => CreateDomainMaintenance(
                    costAmount: invalidCost,
                    currencyCode: "RSD"));
        }
    }

    [Theory]
    [InlineData("RS")]
    [InlineData("R1D")]
    [InlineData("RSDD")]
    [InlineData("€UR")]
    public void RequestAndDomain_RejectInvalidCurrencyCode(
        string currencyCode) {
        var request =
            CreateRecordRequest(
                Guid.NewGuid()) with {
                CostAmount = 1m,
                CurrencyCode = currencyCode
            };

        Assert.Contains(
            Validate(request),
            result =>
                result.MemberNames.Contains(
                    nameof(request.CurrencyCode)));
        Assert.Throws<ArgumentException>(
            () => CreateDomainMaintenance(
                costAmount: 1m,
                currencyCode: currencyCode));
    }

    [Fact]
    public void RequestAndDomain_RejectInvalidMaintenanceType() {
        var invalidType =
            (HiveMaintenanceType)999;

        var request =
            CreateRecordRequest(
                Guid.NewGuid()) with {
                MaintenanceType =
                    invalidType
            };

        Assert.Contains(
            Validate(request),
            result =>
                result.ErrorMessage ==
                    "Invalid maintenance type.");
        Assert.Throws<ArgumentOutOfRangeException>(
            () => CreateDomainMaintenance(
                maintenanceType: invalidType));
    }

    [Fact]
    public void RequestAndDomain_RejectTooLongServiceProvider() {
        var serviceProvider =
            new string(
                'x',
                HiveMaintenanceRules
                    .ServiceProviderMaxLength +
                    1);

        var request =
            CreateRecordRequest(
                Guid.NewGuid()) with {
                ServiceProvider =
                    serviceProvider
            };

        Assert.Contains(
            Validate(request),
            result =>
                result.MemberNames.Contains(
                    nameof(request.ServiceProvider)));
        Assert.Throws<ArgumentException>(
            () => CreateDomainMaintenance(
                serviceProvider: serviceProvider));
    }

    [Fact]
    public async Task Update_AddsCostToExistingMaintenanceWithoutCreatingAnotherActionOrChangingHiveStatus() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var (hive, maintenance) =
            await SeedMaintenanceAsync(
                dbContext,
                beekeeperId);

        var result =
            await UpdateHiveMaintenanceEndpoint
                .HandleAsync(
                    maintenance.Id,
                    CreateUpdateRequest() with {
                        CostAmount = 3_500m,
                        CurrencyCode = "rsd"
                    },
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<UpdateHiveMaintenanceResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var persistedMaintenance =
            Assert.Single(
                await dbContext.HiveMaintenances
                    .AsNoTracking()
                    .ToListAsync());

        Assert.Equal(
            maintenance.Id,
            persistedMaintenance.Id);
        Assert.Equal(3_500m, response.CostAmount);
        Assert.Equal("RSD", response.CurrencyCode);
        Assert.Equal(
            HiveStatus.Active,
            (await dbContext.Hives
                .AsNoTracking()
                .SingleAsync(
                    candidate =>
                        candidate.Id == hive.Id)).Status);
    }

    [Fact]
    public async Task Update_ChangesExistingCost() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var (_, maintenance) =
            await SeedMaintenanceAsync(
                dbContext,
                beekeeperId,
                costAmount: 1_000m,
                currencyCode: "RSD");

        await UpdateHiveMaintenanceEndpoint
            .HandleAsync(
                maintenance.Id,
                CreateUpdateRequest() with {
                    CostAmount = 1_500m,
                    CurrencyCode = "EUR"
                },
                new TestCurrentBeekeeperContext(
                    beekeeperId),
                dbContext,
                CancellationToken.None);

        var updated =
            await dbContext.HiveMaintenances
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(1_500m, updated.CostAmount);
        Assert.Equal("EUR", updated.CurrencyCode);
    }

    [Fact]
    public async Task Update_ChangesAndNormalizesServiceProvider() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var (_, maintenance) =
            await SeedMaintenanceAsync(
                dbContext,
                beekeeperId);

        await UpdateHiveMaintenanceEndpoint
            .HandleAsync(
                maintenance.Id,
                CreateUpdateRequest() with {
                    ServiceProvider =
                        "  Novi servis  "
                },
                new TestCurrentBeekeeperContext(
                    beekeeperId),
                dbContext,
                CancellationToken.None);

        Assert.Equal(
            "Novi servis",
            (await dbContext.HiveMaintenances
                .AsNoTracking()
                .SingleAsync()).ServiceProvider);
    }

    [Fact]
    public async Task Update_OtherBeekeepersMaintenance_ReturnsNotFoundWithoutModification() {
        var ownerBeekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var (_, maintenance) =
            await SeedMaintenanceAsync(
                dbContext,
                ownerBeekeeperId);

        var result =
            await UpdateHiveMaintenanceEndpoint
                .HandleAsync(
                    maintenance.Id,
                    CreateUpdateRequest() with {
                        MaintenanceType =
                            HiveMaintenanceType.PAINTING,
                        CostAmount = 500m,
                        CurrencyCode = "RSD"
                    },
                    new TestCurrentBeekeeperContext(
                        Guid.NewGuid()),
                    dbContext,
                    CancellationToken.None);

        var persistedMaintenance =
            await dbContext.HiveMaintenances
                .AsNoTracking()
                .SingleAsync();

        Assert.Equal(
            StatusCodes.Status404NotFound,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    result)
                .StatusCode);
        Assert.Equal(
            HiveMaintenanceType.FLOOR_REPAIR,
            persistedMaintenance.MaintenanceType);
        Assert.Null(persistedMaintenance.CostAmount);
    }

    [Fact]
    public void Model_ConfiguresMaintenanceColumnsAndConstraints() {
        using var dbContext =
            CreateRelationalDbContext();

        var entityType =
            dbContext.GetService<IDesignTimeModel>()
                .Model
                .FindEntityType(
                    typeof(HiveMaintenance));

        Assert.NotNull(entityType);
        Assert.Equal(
            "hive_maintenance",
            entityType.GetTableName());
        Assert.Equal(
            "hives",
            entityType.GetSchema());

        var costProperty =
            entityType.FindProperty(
                nameof(HiveMaintenance.CostAmount));

        Assert.NotNull(costProperty);
        Assert.Equal(
            HiveMaintenanceRules.CostPrecision,
            costProperty.GetPrecision());
        Assert.Equal(
            HiveMaintenanceRules.CostScale,
            costProperty.GetScale());
        Assert.Equal(
            "numeric(12,2)",
            costProperty.GetColumnType());

        var maintenanceTypeProperty =
            entityType.FindProperty(
                nameof(HiveMaintenance.MaintenanceType));

        Assert.NotNull(maintenanceTypeProperty);
        Assert.NotNull(
            maintenanceTypeProperty
                .GetTypeMapping()
                .Converter);

        var constraintNames =
            entityType.GetCheckConstraints()
                .Select(
                    constraint =>
                        constraint.Name)
                .ToArray();

        Assert.Contains(
            "ck_hive_maintenance_maintenance_type",
            constraintNames);
        Assert.Contains(
            "ck_hive_maintenance_cost_amount_non_negative",
            constraintNames);
        Assert.Contains(
            "ck_hive_maintenance_cost_currency_pair",
            constraintNames);
        Assert.Contains(
            "ck_hive_maintenance_currency_code_format",
            constraintNames);
    }

    private static HivesDbContext CreateDbContext() {
        var options =
            new DbContextOptionsBuilder<HivesDbContext>()
                .UseInMemoryDatabase(
                    Guid.NewGuid()
                        .ToString())
                .Options;

        return new HivesDbContext(options);
    }

    private static HivesDbContext CreateRelationalDbContext() {
        var options =
            new DbContextOptionsBuilder<HivesDbContext>()
                .UseNpgsql(
                    "Host=localhost;Database=model_validation;Username=model_validation;Password=model_validation")
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

    private static HiveMaintenance CreateDomainMaintenance(
        HiveMaintenanceType maintenanceType =
            HiveMaintenanceType.FLOOR_REPAIR,
        decimal? costAmount = null,
        string? currencyCode = null,
        string? serviceProvider = null) {
        return HiveMaintenance.Create(
            Guid.NewGuid(),
            DateTimeOffset.UtcNow,
            Guid.NewGuid(),
            imageUrl: null,
            notes: null,
            maintenanceType,
            costAmount,
            currencyCode,
            serviceProvider);
    }

    private static RecordHiveMaintenanceRequest
        CreateRecordRequest(
            Guid hiveId) {
        return new RecordHiveMaintenanceRequest {
            HiveId =
                hiveId,
            PerformedAt =
                DateTimeOffset.UtcNow,
            MaintenanceType =
                HiveMaintenanceType.FLOOR_REPAIR,
            Notes =
                "Damaged floor replaced"
        };
    }

    private static UpdateHiveMaintenanceRequest
        CreateUpdateRequest() {
        return new UpdateHiveMaintenanceRequest {
            MaintenanceType =
                HiveMaintenanceType.FLOOR_REPAIR
        };
    }

    private static async Task<(
        Hive Hive,
        HiveMaintenance Maintenance)>
        SeedMaintenanceAsync(
            HivesDbContext dbContext,
            Guid beekeeperId,
            decimal? costAmount = null,
            string? currencyCode = null) {
        var hive =
            CreateHive(
                beekeeperId,
                "Hive A");

        var maintenance =
            HiveMaintenance.Create(
                hive.Id,
                DateTimeOffset.UtcNow,
                beekeeperId,
                imageUrl: null,
                notes: null,
                HiveMaintenanceType.FLOOR_REPAIR,
                costAmount,
                currencyCode,
                serviceProvider: null);

        dbContext.Hives.Add(hive);
        dbContext.HiveMaintenances.Add(
            maintenance);

        await dbContext.SaveChangesAsync();

        return (hive, maintenance);
    }

    private static IReadOnlyList<ValidationResult> Validate(
        object request) {
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
