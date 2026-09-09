using System.Text.Json.Serialization;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInspection;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInsulation;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveMaintenance;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.PattyFeeding;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.VaroaTreatment;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;

public sealed record HiveActionHistoryPageResponse(
    IReadOnlyList<HiveActionHistoryItemResponse> Items,
    string? NextCursor);

public sealed record HiveActionHistoryItemResponse(
    Guid Id,
    DateTimeOffset PerformedAt,
    HiveActionType Type,
    HiveActionHistorySummary Summary);

[JsonPolymorphic(
    TypeDiscriminatorPropertyName = "$summaryType")]
[JsonDerivedType(
    typeof(InspectionHistorySummary),
    typeDiscriminator: "inspection")]
[JsonDerivedType(
    typeof(VarroaTreatmentHistorySummary),
    typeDiscriminator: "varroaTreatment")]
[JsonDerivedType(
    typeof(SyrupFeedingHistorySummary),
    typeDiscriminator: "syrupFeeding")]
[JsonDerivedType(
    typeof(PattyFeedingHistorySummary),
    typeDiscriminator: "pattyFeeding")]
[JsonDerivedType(
    typeof(HoneyFrameFeedingHistorySummary),
    typeDiscriminator: "honeyFrameFeeding")]
[JsonDerivedType(
    typeof(InsulationHistorySummary),
    typeDiscriminator: "insulation")]
[JsonDerivedType(
    typeof(MaintenanceHistorySummary),
    typeDiscriminator: "maintenance")]
[JsonDerivedType(
    typeof(SuperManagementHistorySummary),
    typeDiscriminator: "superManagement")]
public abstract record HiveActionHistorySummary;

public sealed record InspectionHistorySummary(
    HiveInspectionType? InspectionType,
    short? OverallConditionRating,
    bool HasHealthIssue)
    : HiveActionHistorySummary;

public sealed record VarroaTreatmentHistorySummary(
    string ProductName,
    VarroaApplicationMethod ApplicationMethod,
    decimal DoseAmount,
    VarroaDoseUnit DoseUnit)
    : HiveActionHistorySummary;

public sealed record SyrupFeedingHistorySummary(
    int QuantityMl,
    decimal SugarParts,
    decimal WaterParts)
    : HiveActionHistorySummary;

public sealed record PattyFeedingHistorySummary(
    int MassG,
    PattyType PattyType,
    string? Manufacturer)
    : HiveActionHistorySummary;

public sealed record HoneyFrameFeedingHistorySummary(
    int FrameCount,
    string? FrameSource)
    : HiveActionHistorySummary;

public sealed record InsulationHistorySummary(
    HiveInsulationOperation Operation,
    bool Paper,
    bool Eps,
    bool Xps)
    : HiveActionHistorySummary;

public sealed record MaintenanceHistorySummary(
    HiveMaintenanceType MaintenanceType,
    decimal? CostAmount,
    string? CurrencyCode,
    string? ServiceProvider)
    : HiveActionHistorySummary;

public sealed record SuperManagementHistorySummary(
    int AffectedSuperCount,
    int AddedSuperCount,
    int AddedFrameCount,
    int RemoveForHarvestCount,
    int RemoveAndArchiveCount,
    int HarvestableFrameCount)
    : HiveActionHistorySummary;
