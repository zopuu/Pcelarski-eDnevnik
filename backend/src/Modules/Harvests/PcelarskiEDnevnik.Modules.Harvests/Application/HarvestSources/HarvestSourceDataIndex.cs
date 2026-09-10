using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal sealed class HarvestSourceDataIndex {
    private readonly Dictionary<
        Guid,
        IReadOnlyList<ApiaryStayHarvestSource>>
        _apiaryStaysByApiaryId;

    private readonly Dictionary<
        Guid,
        ApiaryLocationHarvestSource>
        _locationsById;

    private readonly Dictionary<
        (Guid ApiaryStayId, int Year),
        ForageProfileHarvestSource>
        _profilesByStayAndYear;

    public HarvestSourceDataIndex(
        ApiaryHarvestContextSource source) {
        _apiaryStaysByApiaryId =
            source.ApiaryStays
                .GroupBy(x => x.ApiaryId)
                .ToDictionary(
                    x => x.Key,
                    x =>
                        (IReadOnlyList<
                            ApiaryStayHarvestSource>)
                        x.OrderBy(
                                y =>
                                    y.StartedAtUtc)
                            .ThenBy(y => y.Id)
                            .ToList());

        _locationsById =
            source.Locations
                .ToDictionary(
                    x => x.Id);

        _profilesByStayAndYear =
            source.ForageProfiles
                .ToDictionary(
                    x =>
                        (
                            x.ApiaryStayId,
                            x.Year
                        ));
    }

    public IReadOnlyList<
        ApiaryStayHarvestSource>
        GetApiaryStays(
            Guid apiaryId) {
        return _apiaryStaysByApiaryId
            .GetValueOrDefault(
                apiaryId,
                []);
    }

    public bool TryGetLocation(
        Guid locationId,
        out ApiaryLocationHarvestSource
            location) {
        return _locationsById.TryGetValue(
            locationId,
            out location!);
    }

    public bool TryGetForageProfile(
        Guid apiaryStayId,
        int year,
        out ForageProfileHarvestSource
            profile) {
        return _profilesByStayAndYear
            .TryGetValue(
                (
                    apiaryStayId,
                    year
                ),
                out profile!);
    }
}