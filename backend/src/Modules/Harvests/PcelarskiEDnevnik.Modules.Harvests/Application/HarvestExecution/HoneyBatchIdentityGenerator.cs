namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestExecution;

internal sealed record GeneratedHoneyBatchIdentity(
    string Name,
    string BatchCode);

internal static class HoneyBatchIdentityGenerator {
    public static GeneratedHoneyBatchIdentity
        Generate(
            DateOnly harvestedOn) {
        var suffix =
            Guid.NewGuid()
                .ToString("N")[..8]
                .ToUpperInvariant();

        var batchCode =
            $"HB-{harvestedOn.Year}-{suffix}";

        return new GeneratedHoneyBatchIdentity(
            batchCode,
            batchCode);
    }
}