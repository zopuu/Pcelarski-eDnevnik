namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed record HarvestAvailabilitySnapshot(
    string AlgorithmVersion,
    IReadOnlyList<HarvestSourceGroup> Groups,
    IReadOnlyList<HarvestSourceResolutionIssue>
        Issues);

internal sealed class HarvestAvailabilityService(
    HarvestSourceSetResolver sourceSetResolver,
    HarvestSourceGrouper grouper,
    HarvestGroupingPolicy policy) {
    public async Task<HarvestAvailabilitySnapshot>
        GetAsync(
            Guid beekeeperId,
            CancellationToken cancellationToken) {
        var sourceSet =
            await sourceSetResolver
                .ResolveAvailableAsync(
                    beekeeperId,
                    cancellationToken);

        var groups =
            grouper.Group(
                sourceSet.Sources,
                sourceSet.Index);

        return new HarvestAvailabilitySnapshot(
            policy.AlgorithmVersion,
            groups,
            sourceSet.Issues);
    }
}