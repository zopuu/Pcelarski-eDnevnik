using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.Record;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class HiveInsulationTests {
    [Fact]
    public void Create_SetsBaseAndInsulationProperties() {
        var hiveId =
            Guid.NewGuid();

        var beekeeperId =
            Guid.NewGuid();

        var actionGroupId =
            Guid.NewGuid();

        var performedAt =
            DateTimeOffset.UtcNow;

        var action =
            HiveInsulation.Create(
                hiveId,
                performedAt,
                beekeeperId,
                actionGroupId,
                "  /images/insulation.jpg  ",
                "  Added winter insulation.  ",
                HiveInsulationOperation.Add,
                paper: true,
                eps: true,
                xps: false);

        Assert.NotEqual(
            Guid.Empty,
            action.Id);
        Assert.Equal(
            hiveId,
            action.HiveId);
        Assert.Equal(
            performedAt,
            action.PerformedAt);
        Assert.Equal(
            beekeeperId,
            action.PerformedByBeekeeperId);
        Assert.Equal(
            actionGroupId,
            action.ActionGroupId);
        Assert.Equal(
            "/images/insulation.jpg",
            action.ImageUrl);
        Assert.Equal(
            "Added winter insulation.",
            action.Notes);
        Assert.Equal(
            HiveInsulationOperation.Add,
            action.Operation);
        Assert.True(action.Paper);
        Assert.True(action.Eps);
        Assert.False(action.Xps);
    }

    [Fact]
    public void Create_RejectsActionWithoutSelectedInsulationType() {
        Assert.Throws<ArgumentException>(
            () => HiveInsulation.Create(
                Guid.NewGuid(),
                DateTimeOffset.UtcNow,
                Guid.NewGuid(),
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                HiveInsulationOperation.Add,
                paper: false,
                eps: false,
                xps: false));
    }

    [Fact]
    public void Create_UsesBaseValidationForRequiredIds() {
        Assert.Throws<ArgumentException>(
            () => HiveInsulation.Create(
                Guid.Empty,
                DateTimeOffset.UtcNow,
                Guid.NewGuid(),
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                HiveInsulationOperation.Add,
                paper: true,
                eps: false,
                xps: false));

        Assert.Throws<ArgumentException>(
            () => HiveInsulation.Create(
                Guid.NewGuid(),
                DateTimeOffset.UtcNow,
                Guid.Empty,
                actionGroupId: null,
                imageUrl: null,
                notes: null,
                HiveInsulationOperation.Add,
                paper: true,
                eps: false,
                xps: false));
    }

    [Fact]
    public void RequestValidation_RejectsMissingSelectionsAndDuplicateHives() {
        var hiveId =
            Guid.NewGuid();

        var request =
            new RecordHiveInsulationRequest {
                PerformedAt =
                    DateTimeOffset.UtcNow,
                Operation =
                    HiveInsulationOperation.Add,
                HiveIds =
                [
                    hiveId,
                    hiveId
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
                result.MemberNames.Contains(
                    nameof(request.Paper)));
        Assert.Contains(
            results,
            result =>
                result.MemberNames.Contains(
                    nameof(request.HiveIds)) &&
                result.ErrorMessage ==
                    "Hive IDs must be unique.");
    }
}
