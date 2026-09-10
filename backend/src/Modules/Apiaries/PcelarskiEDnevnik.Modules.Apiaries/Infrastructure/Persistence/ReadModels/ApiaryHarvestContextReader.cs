using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts.Harvesting;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.ReadModels;

internal sealed class ApiaryHarvestContextReader(
    ApiariesDbContext dbContext)
    : IApiaryHarvestContextReader {
    public async Task<ApiaryHarvestContextSource>
        ReadAsync(
            Guid beekeeperId,
            IReadOnlyCollection<Guid> apiaryIds,
            DateOnly startedOn,
            DateOnly endedOn,
            CancellationToken cancellationToken) {
        if (apiaryIds.Count == 0) {
            return Empty();
        }

        var requestedApiaryIds =
            apiaryIds
                .Distinct()
                .ToArray();

        var ownedApiaryIds =
            await dbContext.Apiaries
                .AsNoTracking()
                .Where(
                    x =>
                        requestedApiaryIds.Contains(
                            x.Id)
                        &&
                        x.OwnerBeekeeperId ==
                        beekeeperId)
                .Select(x => x.Id)
                .ToArrayAsync(
                    cancellationToken);

        if (ownedApiaryIds.Length == 0) {
            return Empty();
        }

        var rangeStart =
            AtStartOfDayUtc(
                startedOn);

        var rangeEndExclusive =
            AtStartOfDayUtc(
                endedOn.AddDays(1));

        var apiaryStays =
            await dbContext.ApiaryStays
                .AsNoTracking()
                .Where(
                    x =>
                        ownedApiaryIds.Contains(
                            x.ApiaryId)
                        &&
                        x.StartedAtUtc <
                        rangeEndExclusive
                        &&
                        (
                            x.EndedAtUtc == null
                            ||
                            x.EndedAtUtc >
                            rangeStart
                        ))
                .Select(
                    x =>
                        new ApiaryStayHarvestSource(
                            x.Id,
                            x.ApiaryId,
                            x.LocationId,
                            x.StartedAtUtc,
                            x.EndedAtUtc))
                .OrderBy(x => x.StartedAtUtc)
                .ThenBy(x => x.Id)
                .ToListAsync(
                    cancellationToken);

        if (apiaryStays.Count == 0) {
            return Empty();
        }

        var locationIds =
            apiaryStays
                .Select(x => x.LocationId)
                .Distinct()
                .ToArray();

        var locations =
            await dbContext.Locations
                .AsNoTracking()
                .Where(
                    x =>
                        locationIds.Contains(x.Id)
                        &&
                        x.OwnerBeekeeperId ==
                        beekeeperId)
                .Select(
                    x =>
                        new ApiaryLocationHarvestSource(
                            x.Id,
                            x.Name,
                            x.Latitude,
                            x.Longitude))
                .ToListAsync(
                    cancellationToken);

        var apiaryStayIds =
            apiaryStays
                .Select(x => x.Id)
                .ToArray();

        var firstYear =
            startedOn.Year;

        var lastYear =
            endedOn.Year;

        var profiles =
            await dbContext.ForageProfiles
                .AsNoTracking()
                .Where(
                    x =>
                        apiaryStayIds.Contains(
                            x.ApiaryStayId)
                        &&
                        x.Year >= firstYear
                        &&
                        x.Year <= lastYear)
                .Select(
                    x =>
                        new {
                            x.Id,
                            x.ApiaryStayId,
                            x.Year
                        })
                .ToListAsync(
                    cancellationToken);

        if (profiles.Count == 0) {
            return new ApiaryHarvestContextSource(
                apiaryStays,
                locations,
                []);
        }

        var profileIds =
            profiles
                .Select(x => x.Id)
                .ToArray();

        var itemRows =
            await dbContext.ForageProfileItems
                .AsNoTracking()
                .Where(
                    x =>
                        profileIds.Contains(
                            x.ForageProfileId))
                .Select(
                    x =>
                        new {
                            x.ForageProfileId,
                            x.ForageType,
                            x.Percentage
                        })
                .ToListAsync(
                    cancellationToken);

        var itemsByProfile =
            itemRows
                .GroupBy(
                    x => x.ForageProfileId)
                .ToDictionary(
                    x => x.Key,
                    x =>
                        (IReadOnlyList<
                            ForageProfileItemHarvestSource>)
                        x.Select(
                                item =>
                                    new
                                        ForageProfileItemHarvestSource(
                                            item.ForageType
                                                .ToString(),
                                            item.Percentage))
                            .ToList());

        var forageProfiles =
            profiles
                .Select(
                    profile =>
                        new ForageProfileHarvestSource(
                            profile.Id,
                            profile.ApiaryStayId,
                            profile.Year,
                            itemsByProfile
                                .GetValueOrDefault(
                                    profile.Id,
                                    [])))
                .ToList();

        return new ApiaryHarvestContextSource(
            apiaryStays,
            locations,
            forageProfiles);
    }

    private static ApiaryHarvestContextSource
        Empty() {
        return new ApiaryHarvestContextSource(
            [],
            [],
            []);
    }

    private static DateTimeOffset
        AtStartOfDayUtc(
            DateOnly date) {
        return new DateTimeOffset(
            date.ToDateTime(
                TimeOnly.MinValue),
            TimeSpan.Zero);
    }
}