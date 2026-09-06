using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Relocations.Domain;
using PcelarskiEDnevnik.Modules.Relocations.Features.History;
using PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Relocations.Features.GetByApiary;

public static class GetApiaryRelocationsEndpoint {
    private const int DefaultPageSize = 20;
    private const int MaximumPageSize = 50;

    public static IEndpointRouteBuilder
        MapGetApiaryRelocationsEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/apiary/{apiaryId:guid}",
            async (
                Guid apiaryId,
                int page,
                int pageSize,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext apiariesDbContext,
                HivesDbContext hivesDbContext,
                RelocationsDbContext relocationsDbContext,
                CancellationToken cancellationToken) => {
                if (page < 1 || pageSize < 1 ||
                    pageSize > MaximumPageSize) {
                    return Results.ValidationProblem(
                        new Dictionary<string, string[]> {
                            ["page"] = ["Page must be at least 1."],
                            ["pageSize"] = [
                                $"Page size must be between 1 and {MaximumPageSize}."
                            ]
                        });
                }

                var beekeeperId = await currentBeekeeper
                    .GetBeekeeperIdAsync(cancellationToken);

                var ownsApiary = await apiariesDbContext.Apiaries
                    .AsNoTracking()
                    .AnyAsync(
                        x => x.Id == apiaryId &&
                             x.OwnerBeekeeperId == beekeeperId,
                        cancellationToken);

                if (!ownsApiary) {
                    throw new NotFoundException(
                        "relocations.resource_not_found",
                        "The requested resource was not found.");
                }

                var apiaryStayIds = await apiariesDbContext.ApiaryStays
                    .AsNoTracking()
                    .Where(x => x.ApiaryId == apiaryId)
                    .Select(x => x.Id)
                    .ToListAsync(cancellationToken);

                var hiveStayIds = await hivesDbContext.HiveStays
                    .AsNoTracking()
                    .Where(x => x.ApiaryId == apiaryId)
                    .Select(x => x.Id)
                    .ToListAsync(cancellationToken);

                var apiaryRelocations = await relocationsDbContext
                    .ApiaryRelocations
                    .AsNoTracking()
                    .Where(x => apiaryStayIds.Contains(x.OriginApiaryStayId) ||
                                apiaryStayIds.Contains(x.DestinationApiaryStayId))
                    .ToListAsync(cancellationToken);

                var hiveRelocationItems = await relocationsDbContext
                    .HiveRelocationItems
                    .AsNoTracking()
                    .Where(x => hiveStayIds.Contains(x.OriginHiveStayId) ||
                                hiveStayIds.Contains(x.DestinationHiveStayId))
                    .ToListAsync(cancellationToken);

                var relocationIds = apiaryRelocations
                    .Select(x => x.RelocationId)
                    .Concat(hiveRelocationItems.Select(x => x.HiveRelocationId))
                    .Distinct()
                    .ToArray();

                var relocations = await relocationsDbContext.Relocations
                    .AsNoTracking()
                    .Where(x => relocationIds.Contains(x.Id) &&
                                x.BeekeeperId == beekeeperId)
                    .OrderByDescending(x => x.OccurredAtUtc)
                    .ThenByDescending(x => x.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize + 1)
                    .ToListAsync(cancellationToken);

                var hasNextPage = relocations.Count > pageSize;
                var pageRelocations = relocations
                    .Take(pageSize)
                    .ToList();
                var pageRelocationIds = pageRelocations
                    .Select(x => x.Id)
                    .ToHashSet();

                var pageApiaryRelocations = apiaryRelocations
                    .Where(x => pageRelocationIds.Contains(x.RelocationId))
                    .ToDictionary(x => x.RelocationId);
                var pageHiveItems = hiveRelocationItems
                    .Where(x => pageRelocationIds.Contains(x.HiveRelocationId))
                    .GroupBy(x => x.HiveRelocationId)
                    .ToDictionary(x => x.Key, x => x.ToList());

                var relatedApiaryStayIds = pageApiaryRelocations.Values
                    .SelectMany(x => new[] {
                        x.OriginApiaryStayId,
                        x.DestinationApiaryStayId
                    })
                    .ToHashSet();
                var apiaryStays = await apiariesDbContext.ApiaryStays
                    .AsNoTracking()
                    .Where(x => relatedApiaryStayIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var relatedHiveStayIds = pageHiveItems.Values
                    .SelectMany(x => x)
                    .SelectMany(x => new[] {
                        x.OriginHiveStayId,
                        x.DestinationHiveStayId
                    })
                    .ToHashSet();
                var hiveStays = await hivesDbContext.HiveStays
                    .AsNoTracking()
                    .Where(x => relatedHiveStayIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var relatedApiaryIds = apiaryStays.Values
                    .Select(x => x.ApiaryId)
                    .Concat(hiveStays.Values.Select(x => x.ApiaryId))
                    .Distinct()
                    .ToArray();
                var locationStays = await apiariesDbContext.ApiaryStays
                    .AsNoTracking()
                    .Where(x => relatedApiaryIds.Contains(x.ApiaryId))
                    .ToListAsync(cancellationToken);
                var locationIds = apiaryStays.Values
                    .Select(x => x.LocationId)
                    .Concat(locationStays.Select(x => x.LocationId))
                    .Distinct()
                    .ToArray();
                var locationNames = await apiariesDbContext.Locations
                    .AsNoTracking()
                    .Where(x => locationIds.Contains(x.Id))
                    .ToDictionaryAsync(
                        x => x.Id,
                        x => x.Name,
                        cancellationToken);

                string LocationNameForApiary(
                    Guid relatedApiaryId,
                    DateTimeOffset occurredAtUtc) {
                    var stay = locationStays
                        .Where(x => x.ApiaryId == relatedApiaryId &&
                                    x.StartedAtUtc <= occurredAtUtc &&
                                    (!x.EndedAtUtc.HasValue ||
                                     x.EndedAtUtc >= occurredAtUtc))
                        .OrderByDescending(x => x.StartedAtUtc)
                        .FirstOrDefault();

                    return stay is not null &&
                           locationNames.TryGetValue(
                               stay.LocationId,
                               out var locationName)
                        ? locationName?.Trim() ?? "Lokacija bez naziva"
                        : "Nepoznata lokacija";
                }

                var items = pageRelocations.Select(relocation => {
                    if (relocation.Kind == RelocationKind.WholeApiary) {
                        var relation = pageApiaryRelocations[relocation.Id];
                        var originStay = apiaryStays[relation.OriginApiaryStayId];
                        var destinationStay = apiaryStays[relation.DestinationApiaryStayId];

                        return new RelocationHistoryItemResponse(
                            relocation.Id,
                            relocation.Kind,
                            relocation.OccurredAtUtc,
                            locationNames.GetValueOrDefault(originStay.LocationId)?.Trim() ?? "Lokacija bez naziva",
                            locationNames.GetValueOrDefault(destinationStay.LocationId)?.Trim() ?? "Lokacija bez naziva",
                            null,
                            relocation.TransportMethod,
                            relocation.DistanceKm,
                            relocation.Notes);
                    }

                    var itemsForRelocation = pageHiveItems[relocation.Id];
                    var originHiveStay = hiveStays[itemsForRelocation[0].OriginHiveStayId];
                    var destinationHiveStay = hiveStays[itemsForRelocation[0].DestinationHiveStayId];

                    return new RelocationHistoryItemResponse(
                        relocation.Id,
                        relocation.Kind,
                        relocation.OccurredAtUtc,
                        LocationNameForApiary(originHiveStay.ApiaryId, relocation.OccurredAtUtc),
                        LocationNameForApiary(destinationHiveStay.ApiaryId, relocation.OccurredAtUtc),
                        itemsForRelocation.Count,
                        relocation.TransportMethod,
                        relocation.DistanceKm,
                        relocation.Notes);
                }).ToList();

                return Results.Ok(new RelocationHistoryPageResponse(
                    items,
                    page,
                    hasNextPage));
            });

        return endpoints;
    }
}
