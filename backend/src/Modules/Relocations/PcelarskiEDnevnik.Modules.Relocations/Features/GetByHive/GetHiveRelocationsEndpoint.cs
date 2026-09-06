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

namespace PcelarskiEDnevnik.Modules.Relocations.Features.GetByHive;

public static class GetHiveRelocationsEndpoint {
    private const int MaximumPageSize = 50;

    public static IEndpointRouteBuilder
        MapGetHiveRelocationsEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/hive/{hiveId:guid}",
            async (
                Guid hiveId,
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
                var ownsHive = await hivesDbContext.Hives
                    .AsNoTracking()
                    .AnyAsync(
                        x => x.Id == hiveId &&
                             x.OwnerBeekeeperId == beekeeperId,
                        cancellationToken);

                if (!ownsHive) {
                    throw new NotFoundException(
                        "relocations.resource_not_found",
                        "The requested resource was not found.");
                }

                var hiveStays = await hivesDbContext.HiveStays
                    .AsNoTracking()
                    .Where(x => x.HiveId == hiveId)
                    .ToListAsync(cancellationToken);
                var hiveStayIds = hiveStays
                    .Select(x => x.Id)
                    .ToHashSet();
                var relatedHiveItems = await relocationsDbContext
                    .HiveRelocationItems
                    .AsNoTracking()
                    .Where(x => hiveStayIds.Contains(x.OriginHiveStayId) ||
                                hiveStayIds.Contains(x.DestinationHiveStayId))
                    .ToListAsync(cancellationToken);

                var hiveApiaryIds = hiveStays
                    .Select(x => x.ApiaryId)
                    .Distinct()
                    .ToArray();
                var apiaryStays = await apiariesDbContext.ApiaryStays
                    .AsNoTracking()
                    .Where(x => hiveApiaryIds.Contains(x.ApiaryId))
                    .ToListAsync(cancellationToken);
                var apiaryStaysById = apiaryStays
                    .ToDictionary(x => x.Id);
                var apiaryStayIds = apiaryStaysById.Keys.ToHashSet();
                var candidateApiaryRelocations = await relocationsDbContext
                    .ApiaryRelocations
                    .AsNoTracking()
                    .Where(x => apiaryStayIds.Contains(x.OriginApiaryStayId) ||
                                apiaryStayIds.Contains(x.DestinationApiaryStayId))
                    .ToListAsync(cancellationToken);

                var candidateRelocationIds = relatedHiveItems
                    .Select(x => x.HiveRelocationId)
                    .Concat(candidateApiaryRelocations.Select(x => x.RelocationId))
                    .Distinct()
                    .ToArray();
                var candidateRelocations = await relocationsDbContext.Relocations
                    .AsNoTracking()
                    .Where(x => candidateRelocationIds.Contains(x.Id) &&
                                x.BeekeeperId == beekeeperId)
                    .ToListAsync(cancellationToken);

                var wholeApiaryRelocationIds = candidateApiaryRelocations
                    .Where(relation => {
                        var originApiaryStay = apiaryStaysById[
                            relation.OriginApiaryStayId];
                        var relocation = candidateRelocations
                            .Single(x => x.Id == relation.RelocationId);

                        return hiveStays.Any(
                            stay => stay.ApiaryId == originApiaryStay.ApiaryId &&
                                    stay.StartedAtUtc <= relocation.OccurredAtUtc &&
                                    (!stay.EndedAtUtc.HasValue ||
                                     stay.EndedAtUtc >= relocation.OccurredAtUtc));
                    })
                    .Select(x => x.RelocationId)
                    .ToHashSet();
                var selectedHiveRelocationIds = relatedHiveItems
                    .Select(x => x.HiveRelocationId)
                    .ToHashSet();
                var relocationIds = wholeApiaryRelocationIds
                    .Concat(selectedHiveRelocationIds)
                    .ToHashSet();

                var orderedRelocations = candidateRelocations
                    .Where(x => relocationIds.Contains(x.Id))
                    .OrderByDescending(x => x.OccurredAtUtc)
                    .ThenByDescending(x => x.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize + 1)
                    .ToList();
                var hasNextPage = orderedRelocations.Count > pageSize;
                var pageRelocations = orderedRelocations
                    .Take(pageSize)
                    .ToList();
                var pageRelocationIds = pageRelocations
                    .Select(x => x.Id)
                    .ToHashSet();
                var apiaryRelations = candidateApiaryRelocations
                    .Where(x => pageRelocationIds.Contains(x.RelocationId))
                    .ToDictionary(x => x.RelocationId);

                var allHiveItems = await relocationsDbContext.HiveRelocationItems
                    .AsNoTracking()
                    .Where(x => pageRelocationIds.Contains(x.HiveRelocationId))
                    .ToListAsync(cancellationToken);
                var hiveItemsByRelocation = allHiveItems
                    .GroupBy(x => x.HiveRelocationId)
                    .ToDictionary(x => x.Key, x => x.ToList());
                var relatedHiveStayIds = allHiveItems
                    .SelectMany(x => new[] {
                        x.OriginHiveStayId,
                        x.DestinationHiveStayId
                    })
                    .ToHashSet();
                var relatedHiveStays = await hivesDbContext.HiveStays
                    .AsNoTracking()
                    .Where(x => relatedHiveStayIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var locationIds = apiaryStays
                    .Select(x => x.LocationId)
                    .Distinct()
                    .ToArray();
                var locationNames = await apiariesDbContext.Locations
                    .AsNoTracking()
                    .Where(x => locationIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);

                string LocationForApiary(
                    Guid apiaryId,
                    DateTimeOffset occurredAtUtc) {
                    var stay = apiaryStays
                        .Where(x => x.ApiaryId == apiaryId &&
                                    x.StartedAtUtc <= occurredAtUtc &&
                                    (!x.EndedAtUtc.HasValue ||
                                     x.EndedAtUtc >= occurredAtUtc))
                        .OrderByDescending(x => x.StartedAtUtc)
                        .FirstOrDefault();

                    return stay is not null &&
                           locationNames.TryGetValue(stay.LocationId, out var name)
                        ? name?.Trim() ?? "Lokacija bez naziva"
                        : "Nepoznata lokacija";
                }

                var items = pageRelocations.Select(relocation => {
                    if (relocation.Kind == RelocationKind.WholeApiary) {
                        var relation = apiaryRelations[relocation.Id];
                        var originStay = apiaryStaysById[relation.OriginApiaryStayId];
                        var destinationStay = apiaryStaysById[relation.DestinationApiaryStayId];

                        return new RelocationHistoryItemResponse(
                            relocation.Id, relocation.Kind, relocation.OccurredAtUtc,
                            locationNames.GetValueOrDefault(originStay.LocationId)?.Trim() ?? "Lokacija bez naziva",
                            locationNames.GetValueOrDefault(destinationStay.LocationId)?.Trim() ?? "Lokacija bez naziva",
                            null, relocation.TransportMethod, relocation.DistanceKm,
                            relocation.Notes);
                    }

                    var itemsForRelocation = hiveItemsByRelocation[relocation.Id];
                    var originHiveStay = relatedHiveStays[
                        itemsForRelocation[0].OriginHiveStayId];
                    var destinationHiveStay = relatedHiveStays[
                        itemsForRelocation[0].DestinationHiveStayId];

                    return new RelocationHistoryItemResponse(
                        relocation.Id, relocation.Kind, relocation.OccurredAtUtc,
                        LocationForApiary(originHiveStay.ApiaryId, relocation.OccurredAtUtc),
                        LocationForApiary(destinationHiveStay.ApiaryId, relocation.OccurredAtUtc),
                        itemsForRelocation.Count, relocation.TransportMethod,
                        relocation.DistanceKm, relocation.Notes);
                }).ToList();

                return Results.Ok(new RelocationHistoryPageResponse(
                    items, page, hasNextPage));
            });

        return endpoints;
    }
}
