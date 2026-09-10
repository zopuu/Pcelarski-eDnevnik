using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;
using PcelarskiEDnevnik.Modules.Hives.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed record ResolvedHarvestSourceSet(
    IReadOnlyList<ResolvedHarvestSource> Sources,
    HarvestSourceDataIndex Index,
    IReadOnlyList<HarvestSourceResolutionIssue> Issues);

internal sealed class HarvestSourceSetResolver(
    IHarvestableSuperSourceReader superSourceReader,
    IApiaryHarvestContextReader apiaryContextReader,
    HarvestSourceResolver sourceResolver) {
    public async Task<ResolvedHarvestSourceSet>
        ResolveAvailableAsync(
            Guid beekeeperId,
            CancellationToken cancellationToken) {
        var candidates =
            await superSourceReader.ReadAsync(
                beekeeperId,
                cancellationToken);

        return await ResolveAsync(
            beekeeperId,
            candidates,
            cancellationToken);
    }

    public async Task<ResolvedHarvestSourceSet>
        ResolveByIdsAsync(
            Guid beekeeperId,
            IReadOnlyCollection<Guid> hiveSuperStayIds,
            CancellationToken cancellationToken) {
        var candidates =
            await superSourceReader.ReadByIdsAsync(
                beekeeperId,
                hiveSuperStayIds,
                cancellationToken);

        return await ResolveAsync(
            beekeeperId,
            candidates,
            cancellationToken);
    }

    private async Task<ResolvedHarvestSourceSet>
        ResolveAsync(
            Guid beekeeperId,
            IReadOnlyList<HarvestableSuperStaySource>
                candidates,
            CancellationToken cancellationToken) {
        if (candidates.Count == 0) {
            return Empty();
        }

        var apiaryIds =
            candidates
                .SelectMany(x => x.HiveStays)
                .Select(x => x.ApiaryId)
                .Distinct()
                .ToArray();

        var startedOn =
            candidates.Min(
                x => x.StartedOn);

        var endedOn =
            candidates.Max(
                x => x.EndedOn);

        var apiaryContext =
            await apiaryContextReader.ReadAsync(
                beekeeperId,
                apiaryIds,
                startedOn,
                endedOn,
                cancellationToken);

        var index =
            new HarvestSourceDataIndex(
                apiaryContext);

        var resolved =
            new List<ResolvedHarvestSource>(
                candidates.Count);

        var issues =
            new List<
                HarvestSourceResolutionIssue>();

        foreach (var candidate in candidates) {
            var result =
                sourceResolver.Resolve(
                    candidate,
                    index);

            if (result.Source is not null) {
                resolved.Add(
                    result.Source);

                continue;
            }

            if (result.Issue is not null) {
                issues.Add(
                    result.Issue);
            }
        }

        return new ResolvedHarvestSourceSet(
            resolved,
            index,
            issues);
    }

    private static ResolvedHarvestSourceSet
        Empty() {
        return new ResolvedHarvestSourceSet(
            [],
            new HarvestSourceDataIndex(
                new ApiaryHarvestContextSource(
                    [],
                    [],
                    [])),
            []);
    }
}