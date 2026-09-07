namespace PcelarskiEDnevnik.Modules.Hives.Features.SyrupFeedings.GetFeedingOptions;

public sealed record SyrupFeedingHiveOptionResponse(
    Guid HiveId,
    int FeederCapacityMl);
