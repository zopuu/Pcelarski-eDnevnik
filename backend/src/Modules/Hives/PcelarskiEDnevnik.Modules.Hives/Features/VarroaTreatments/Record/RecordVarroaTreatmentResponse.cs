using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.Record;

public sealed record RecordVarroaTreatmentResponse(
    Guid? ActionGroupId,
    int AffectedHiveCount,
    string ProductName,
    VarroaApplicationMethod ApplicationMethod,
    decimal DoseAmount,
    VarroaDoseUnit DoseUnit,
    decimal TotalDoseAmount);
