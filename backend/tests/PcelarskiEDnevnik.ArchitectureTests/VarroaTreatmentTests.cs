using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.VaroaTreatment;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;
using PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.Record;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class VarroaTreatmentTests {
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
            await RecordVarroaTreatmentEndpoint
                .HandleAsync(
                    CreateRequest(hive.Id),
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<RecordVarroaTreatmentResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var action =
            Assert.Single(
                await dbContext.VarroaTreatments
                    .AsNoTracking()
                    .ToListAsync());

        Assert.Equal(
            StatusCodes.Status201Created,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    result)
                .StatusCode);
        Assert.Null(response.ActionGroupId);
        Assert.Equal(1, response.AffectedHiveCount);
        Assert.Equal(5m, response.TotalDoseAmount);
        Assert.Equal(hive.Id, action.HiveId);
        Assert.Equal(beekeeperId, action.PerformedByBeekeeperId);
        Assert.Null(action.ActionGroupId);
        Assert.Equal("Api-Bioxal", action.ProductName);
        Assert.Equal(
            VarroaApplicationMethod.TRICKLING,
            action.ApplicationMethod);
        Assert.Equal(5m, action.DoseAmount);
        Assert.Equal(
            VarroaDoseUnit.ML,
            action.DoseUnit);
    }

    [Fact]
    public async Task Record_ValidBulk_PersistsSeparateIdenticalActionsWithSharedGroupAndAggregate() {
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
            await RecordVarroaTreatmentEndpoint
                .HandleAsync(
                    CreateRequest(
                        hives.Select(
                                hive =>
                                    hive.Id)
                            .ToArray()),
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        var response =
            Assert.IsType<RecordVarroaTreatmentResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        result)
                    .Value);

        var actions =
            await dbContext.VarroaTreatments
                .AsNoTracking()
                .ToListAsync();

        Assert.NotNull(response.ActionGroupId);
        Assert.Equal(3, response.AffectedHiveCount);
        Assert.Equal(15m, response.TotalDoseAmount);
        Assert.Equal("Api-Bioxal", response.ProductName);
        Assert.Equal(
            VarroaApplicationMethod.TRICKLING,
            response.ApplicationMethod);
        Assert.Equal(5m, response.DoseAmount);
        Assert.Equal(
            VarroaDoseUnit.ML,
            response.DoseUnit);
        Assert.Equal(3, actions.Count);
        Assert.Equal(
            hives.Select(
                    hive =>
                        hive.Id)
                .Order()
                .ToArray(),
            actions.Select(
                    action =>
                        action.HiveId)
                .Order()
                .ToArray());
        Assert.All(
            actions,
            action => {
                Assert.Equal(
                    response.ActionGroupId,
                    action.ActionGroupId);
                Assert.Equal("Api-Bioxal", action.ProductName);
                Assert.Equal(
                    VarroaApplicationMethod.TRICKLING,
                    action.ApplicationMethod);
                Assert.Equal(5m, action.DoseAmount);
                Assert.Equal(
                    VarroaDoseUnit.ML,
                    action.DoseUnit);
            });
        Assert.Equal(
            actions.Sum(
                action =>
                    action.DoseAmount),
            response.TotalDoseAmount);
    }

    [Fact]
    public async Task GetHistoryAndById_ReturnOnlyOwnedVarroaTreatment() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var hive =
            CreateHive(
                beekeeperId,
                "Hive A");

        var treatment =
            VarroaTreatment.Create(
                hive.Id,
                DateTimeOffset.UtcNow,
                beekeeperId,
                actionGroupId: null,
                imageUrl: null,
                notes: "  Follow-up after seven days.  ",
                productName: "  Api-Bioxal  ",
                applicationMethod:
                    VarroaApplicationMethod.TRICKLING,
                doseAmount: 5m,
                doseUnit:
                    VarroaDoseUnit.ML);

        dbContext.Hives.Add(
            hive);
        dbContext.VarroaTreatments.Add(
            treatment);
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
            HiveActionType.VarroaTreatment,
            historyItem.Type);
        Assert.Equal(
            treatment.Id,
            historyItem.Id);
        var summary =
            Assert.IsType<VarroaTreatmentHistorySummary>(
                historyItem.Summary);
        Assert.Equal(
            "Api-Bioxal",
            summary.ProductName);
        Assert.Equal(5m, summary.DoseAmount);

        var detailResult =
            await GetVarroaTreatmentByIdEndpoint
                .HandleAsync(
                    hive.Id,
                    treatment.Id,
                    currentBeekeeper,
                    dbContext,
                    CancellationToken.None);

        var detail =
            Assert.IsType<VarroaTreatmentDetailsResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        detailResult)
                    .Value);

        Assert.Equal(
            treatment.Id,
            detail.Id);
        Assert.Equal(
            "Api-Bioxal",
            detail.ProductName);
        Assert.Equal(
            "Follow-up after seven days.",
            detail.Notes);
    }

    [Fact]
    public async Task Record_DuplicateHiveIds_ReturnsValidationProblemWithoutPersistingActions() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var hiveId =
            Guid.NewGuid();

        var request =
            CreateRequest(
                hiveId,
                hiveId);

        var validationResults =
            Validate(request);

        var result =
            await RecordVarroaTreatmentEndpoint
                .HandleAsync(
                    request,
                    new TestCurrentBeekeeperContext(
                        beekeeperId),
                    dbContext,
                    CancellationToken.None);

        Assert.Contains(
            validationResults,
            validationResult =>
                validationResult.ErrorMessage ==
                    "Hive IDs must be unique.");
        Assert.Equal(
            StatusCodes.Status400BadRequest,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    result)
                .StatusCode);
        Assert.Empty(
            await dbContext.VarroaTreatments
                .AsNoTracking()
                .ToListAsync());
    }

    [Fact]
    public async Task History_UsesCursorPaginationAndRejectsMalformedCursor() {
        var beekeeperId =
            Guid.NewGuid();

        await using var dbContext =
            CreateDbContext();

        var hive =
            CreateHive(
                beekeeperId,
                "Hive A");
        var performedAt =
            DateTimeOffset.UtcNow;
        var olderTreatment =
            VarroaTreatment.Create(
                hive.Id,
                performedAt,
                beekeeperId,
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                productName: "Older",
                applicationMethod:
                    VarroaApplicationMethod.TRICKLING,
                doseAmount: 5m,
                doseUnit:
                    VarroaDoseUnit.ML);
        var newerTreatment =
            VarroaTreatment.Create(
                hive.Id,
                performedAt.AddMinutes(1),
                beekeeperId,
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                productName: "Newer",
                applicationMethod:
                    VarroaApplicationMethod.TRICKLING,
                doseAmount: 5m,
                doseUnit:
                    VarroaDoseUnit.ML);

        dbContext.Hives.Add(hive);
        dbContext.VarroaTreatments.AddRange(
            olderTreatment,
            newerTreatment);
        await dbContext.SaveChangesAsync();

        var currentBeekeeper =
            new TestCurrentBeekeeperContext(
                beekeeperId);
        var firstResult =
            await GetHiveActionHistoryEndpoint
                .HandleAsync(
                    hive.Id,
                    currentBeekeeper,
                    dbContext,
                    CancellationToken.None,
                    limit: 1);
        var firstPage =
            Assert.IsType<HiveActionHistoryPageResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        firstResult)
                    .Value);

        Assert.Equal(
            newerTreatment.Id,
            Assert.Single(firstPage.Items).Id);
        Assert.NotNull(firstPage.NextCursor);

        var secondResult =
            await GetHiveActionHistoryEndpoint
                .HandleAsync(
                    hive.Id,
                    currentBeekeeper,
                    dbContext,
                    CancellationToken.None,
                    cursor: firstPage.NextCursor,
                    limit: 1);
        var secondPage =
            Assert.IsType<HiveActionHistoryPageResponse>(
                Assert.IsAssignableFrom<IValueHttpResult>(
                        secondResult)
                    .Value);

        Assert.Equal(
            olderTreatment.Id,
            Assert.Single(secondPage.Items).Id);
        Assert.Null(secondPage.NextCursor);

        var invalidCursorResult =
            await GetHiveActionHistoryEndpoint
                .HandleAsync(
                    hive.Id,
                    currentBeekeeper,
                    dbContext,
                    CancellationToken.None,
                    cursor: "invalid");

        Assert.Equal(
            StatusCodes.Status400BadRequest,
            Assert.IsAssignableFrom<IStatusCodeHttpResult>(
                    invalidCursorResult)
                .StatusCode);
    }

    [Fact]
    public void RequestValidation_RejectsEmptyHiveList() {
        var request =
            CreateRequest() with {
                HiveIds =
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

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void RequestAndDomain_RejectNonPositiveDose(
        int doseAmount) {
        var request =
            CreateRequest(
                Guid.NewGuid()) with {
                DoseAmount =
                    doseAmount
            };

        var results =
            Validate(request);

        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Dose amount must be positive.");
        Assert.Throws<ArgumentOutOfRangeException>(
            () => CreateDomainTreatment(
                doseAmount: doseAmount));
    }

    [Fact]
    public void RequestAndDomain_RejectMissingProductName() {
        var request =
            CreateRequest(
                Guid.NewGuid()) with {
                ProductName =
                    "   "
            };

        var results =
            Validate(request);

        Assert.Contains(
            results,
            result =>
                result.MemberNames.Contains(
                    nameof(request.ProductName)));
        Assert.Throws<ArgumentException>(
            () => CreateDomainTreatment(
                productName: "   "));
    }

    [Fact]
    public void RequestAndDomain_RejectTooLongNormalizedProductName() {
        var productName =
            new string(
                'x',
                VarroaTreatmentRules
                    .ProductNameMaxLength +
                1);

        var request =
            CreateRequest(
                Guid.NewGuid()) with {
                ProductName =
                    productName
            };

        var results =
            Validate(request);

        Assert.Contains(
            results,
            result =>
                result.MemberNames.Contains(
                    nameof(request.ProductName)));
        Assert.Throws<ArgumentException>(
            () => CreateDomainTreatment(
                productName: productName));
    }

    [Fact]
    public void RequestAndDomain_RejectInvalidApplicationMethod() {
        var invalidMethod =
            (VarroaApplicationMethod)999;

        var request =
            CreateRequest(
                Guid.NewGuid()) with {
                ApplicationMethod =
                    invalidMethod
            };

        var results =
            Validate(request);

        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Invalid application method.");
        Assert.Throws<ArgumentOutOfRangeException>(
            () => CreateDomainTreatment(
                applicationMethod: invalidMethod));
    }

    [Fact]
    public void RequestAndDomain_RejectInvalidDoseUnit() {
        var invalidUnit =
            (VarroaDoseUnit)999;

        var request =
            CreateRequest(
                Guid.NewGuid()) with {
                DoseUnit =
                    invalidUnit
            };

        var results =
            Validate(request);

        Assert.Contains(
            results,
            result =>
                result.ErrorMessage ==
                    "Invalid dose unit.");
        Assert.Throws<ArgumentOutOfRangeException>(
            () => CreateDomainTreatment(
                doseUnit: invalidUnit));
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
            await RecordVarroaTreatmentEndpoint
                .HandleAsync(
                    CreateRequest(
                        ownedHive.Id,
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
            await dbContext.VarroaTreatments
                .AsNoTracking()
                .ToListAsync());
    }

    [Fact]
    public void Model_ConfiguresVarroaTreatmentColumnsAndConstraints() {
        using var dbContext =
            CreateRelationalDbContext();

        var entityType =
            dbContext.GetService<IDesignTimeModel>()
                .Model
                .FindEntityType(
                    typeof(VarroaTreatment));

        Assert.NotNull(entityType);
        Assert.Equal(
            "varroa_treatments",
            entityType.GetTableName());
        Assert.Equal(
            "hives",
            entityType.GetSchema());

        var doseAmountProperty =
            entityType.FindProperty(
                nameof(VarroaTreatment.DoseAmount));

        Assert.NotNull(doseAmountProperty);
        Assert.Equal(4, doseAmountProperty.GetPrecision());
        Assert.Equal(2, doseAmountProperty.GetScale());
        Assert.Equal(
            "numeric(4,2)",
            doseAmountProperty.GetColumnType());

        var constraintNames =
            entityType.GetCheckConstraints()
                .Select(
                    constraint =>
                        constraint.Name)
                .ToArray();

        Assert.Contains(
            "ck_varroa_treatments_dose_amount_positive",
            constraintNames);
        Assert.Contains(
            "ck_varroa_treatments_application_method",
            constraintNames);
        Assert.Contains(
            "ck_varroa_treatments_dose_unit",
            constraintNames);
    }

    [Fact]
    public void HistoryBaseQuery_UsesOnlyHiveActionsTable() {
        using var dbContext =
            CreateRelationalDbContext();

        var hiveActionEntityType =
            dbContext.GetService<IDesignTimeModel>()
                .Model
                .FindEntityType(
                    typeof(HiveAction));
        var actionTypeProperty =
            hiveActionEntityType?.FindProperty(
                nameof(HiveAction.ActionType));

        Assert.NotNull(actionTypeProperty);
        Assert.Equal(
            "action_type",
            actionTypeProperty.GetColumnName());
        Assert.Contains(
            "ck_hive_actions_action_type",
            hiveActionEntityType!
                .GetCheckConstraints()
                .Select(
                    constraint =>
                        constraint.Name));

        var sql =
            new HiveActionHistoryReader(
                    dbContext)
                .CreateBaseTimelineQuery(
                    Guid.NewGuid(),
                    cursor: null)
                .OrderByDescending(
                    action =>
                        action.PerformedAt)
                .ThenByDescending(
                    action =>
                        action.Id)
                .Take(21)
                .ToQueryString();

        Assert.Contains(
            "hive_actions",
            sql);
        Assert.DoesNotContain(
            "varroa_treatments",
            sql);
        Assert.DoesNotContain(
            "syrup_feedings",
            sql);
        Assert.DoesNotContain(
            "patty_feedings",
            sql);
        Assert.DoesNotContain(
            "hive_inspections",
            sql);
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

    private static RecordVarroaTreatmentRequest CreateRequest(
        params Guid[] hiveIds) {
        return new RecordVarroaTreatmentRequest {
            PerformedAt =
                DateTimeOffset.UtcNow,
            ProductName =
                "  Api-Bioxal  ",
            ApplicationMethod =
                VarroaApplicationMethod.TRICKLING,
            DoseAmount =
                5m,
            DoseUnit =
                VarroaDoseUnit.ML,
            HiveIds =
                hiveIds.ToList()
        };
    }

    private static VarroaTreatment CreateDomainTreatment(
        string productName = "Api-Bioxal",
        VarroaApplicationMethod applicationMethod =
            VarroaApplicationMethod.TRICKLING,
        decimal doseAmount = 5m,
        VarroaDoseUnit doseUnit = VarroaDoseUnit.ML) {
        return VarroaTreatment.Create(
            Guid.NewGuid(),
            DateTimeOffset.UtcNow,
            Guid.NewGuid(),
            actionGroupId: null,
            imageUrl: null,
            notes: null,
            productName,
            applicationMethod,
            doseAmount,
            doseUnit);
    }

    private static IReadOnlyList<ValidationResult> Validate(
        RecordVarroaTreatmentRequest request) {
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
