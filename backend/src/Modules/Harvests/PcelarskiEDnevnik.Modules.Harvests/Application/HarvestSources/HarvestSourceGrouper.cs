namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class HarvestSourceGrouper(
    HarvestSourceCompatibility compatibility) {
    public IReadOnlyList<HarvestSourceGroup>
        Group(
            IReadOnlyList<ResolvedHarvestSource>
                sources,
            HarvestSourceDataIndex index) {
        var ordered =
            sources
                .OrderBy(
                    x =>
                        x.SuperStay
                            .StartedOn)
                .ThenBy(
                    x =>
                        x.SuperStay
                            .EndedOn)
                .ThenBy(
                    x =>
                        x.SuperStay
                            .HiveSuperStayId)
                .ToList();

        var groups =
            new List<
                List<ResolvedHarvestSource>>();

        foreach (var candidate in ordered) {
            List<ResolvedHarvestSource>?
                matchingGroup = null;

            foreach (var group in groups) {
                var compatibleWithEveryMember =
                    group.All(
                        existing =>
                            compatibility
                                .AreCompatible(
                                    candidate,
                                    existing,
                                    index));

                if (!compatibleWithEveryMember) {
                    continue;
                }

                matchingGroup = group;
                break;
            }

            if (matchingGroup is null) {
                groups.Add(
                    [candidate]);

                continue;
            }

            matchingGroup.Add(
                candidate);
        }

        return groups
            .Select(
                x =>
                    new HarvestSourceGroup(
                        x))
            .ToList();
    }
}