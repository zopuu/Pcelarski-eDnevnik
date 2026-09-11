namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Finalize;

public sealed record FinalizeHoneyBatchResponse(
    Guid Id,
    string Status,
    string BatchCode,
    decimal TotalAmount,
    string Unit,
    DateOnly PeriodStartedOn,
    DateOnly PeriodEndedOn);
