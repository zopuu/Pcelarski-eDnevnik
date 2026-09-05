using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Relocations.Domain;
using PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Relocations.Features.GetById;

public static class GetRelocationByIdEndpoint {
    public static IEndpointRouteBuilder
        MapGetRelocationByIdEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapGet(
            "/{relocationId:guid}",
            async (
                Guid relocationId,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext apiariesDbContext,
                HivesDbContext hivesDbContext,
                RelocationsDbContext relocationsDbContext,
                CancellationToken cancellationToken) => {
                var beekeeperId = await currentBeekeeper
                    .GetBeekeeperIdAsync(cancellationToken);
                var relocation = await relocationsDbContext.Relocations
                    .AsNoTracking()
                    .SingleOrDefaultAsync(
                        x => x.Id == relocationId &&
                             x.BeekeeperId == beekeeperId,
                        cancellationToken);

                if (relocation is null) {
                    throw new NotFoundException(
                        "relocations.resource_not_found",
                        "The requested resource was not found.");
                }

                var apiaryRelocation = await relocationsDbContext
                    .ApiaryRelocations
                    .AsNoTracking()
                    .SingleOrDefaultAsync(
                        x => x.RelocationId == relocation.Id,
                        cancellationToken);

                Guid originApiaryId;
                Guid destinationApiaryId;
                ApiaryStay originApiaryStay;
                ApiaryStay destinationApiaryStay;
                int? hiveCount = null;

                if (apiaryRelocation is not null) {
                    var stayIds = new[] {
                        apiaryRelocation.OriginApiaryStayId,
                        apiaryRelocation.DestinationApiaryStayId
                    };
                    var stays = await apiariesDbContext.ApiaryStays
                        .AsNoTracking()
                        .Where(x => stayIds.Contains(x.Id))
                        .ToDictionaryAsync(x => x.Id, cancellationToken);

                    originApiaryStay = stays[
                        apiaryRelocation.OriginApiaryStayId];
                    destinationApiaryStay = stays[
                        apiaryRelocation.DestinationApiaryStayId];
                    originApiaryId = originApiaryStay.ApiaryId;
                    destinationApiaryId = destinationApiaryStay.ApiaryId;
                }
                else {
                    var hiveItems = await relocationsDbContext
                        .HiveRelocationItems
                        .AsNoTracking()
                        .Where(x => x.HiveRelocationId == relocation.Id)
                        .ToListAsync(cancellationToken);

                    if (hiveItems.Count == 0) {
                        throw new NotFoundException(
                            "relocations.resource_not_found",
                            "The requested resource was not found.");
                    }

                    hiveCount = hiveItems.Count;
                    var firstItem = hiveItems[0];
                    var hiveStayIds = new[] {
                        firstItem.OriginHiveStayId,
                        firstItem.DestinationHiveStayId
                    };
                    var hiveStays = await hivesDbContext.HiveStays
                        .AsNoTracking()
                        .Where(x => hiveStayIds.Contains(x.Id))
                        .ToDictionaryAsync(x => x.Id, cancellationToken);
                    originApiaryId = hiveStays[
                        firstItem.OriginHiveStayId].ApiaryId;
                    destinationApiaryId = hiveStays[
                        firstItem.DestinationHiveStayId].ApiaryId;

                    var apiaryIds = new[] {
                        originApiaryId,
                        destinationApiaryId
                    };
                    var stays = await apiariesDbContext.ApiaryStays
                        .AsNoTracking()
                        .Where(x => apiaryIds.Contains(x.ApiaryId) &&
                                    x.StartedAtUtc <= relocation.OccurredAtUtc &&
                                    (!x.EndedAtUtc.HasValue ||
                                     x.EndedAtUtc >= relocation.OccurredAtUtc))
                        .ToListAsync(cancellationToken);
                    originApiaryStay = stays
                        .Where(x => x.ApiaryId == originApiaryId)
                        .OrderByDescending(x => x.StartedAtUtc)
                        .First();
                    destinationApiaryStay = stays
                        .Where(x => x.ApiaryId == destinationApiaryId)
                        .OrderByDescending(x => x.StartedAtUtc)
                        .First();
                }

                var endpointApiaryIds = new[] {
                    originApiaryId,
                    destinationApiaryId
                };
                var apiaries = await apiariesDbContext.Apiaries
                    .AsNoTracking()
                    .Where(x => endpointApiaryIds.Contains(x.Id) &&
                                x.OwnerBeekeeperId == beekeeperId)
                    .ToDictionaryAsync(x => x.Id, cancellationToken);
                var locationIds = new[] {
                    originApiaryStay.LocationId,
                    destinationApiaryStay.LocationId
                };
                var locations = await apiariesDbContext.Locations
                    .AsNoTracking()
                    .Where(x => locationIds.Contains(x.Id) &&
                                x.OwnerBeekeeperId == beekeeperId)
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                ApiaryRelocationPlaceResponse ToPlace(
                    Guid apiaryId,
                    ApiaryStay stay) {
                    var apiary = apiaries[apiaryId];
                    var location = locations[stay.LocationId];

                    return new ApiaryRelocationPlaceResponse(
                        new RelocationApiaryResponse(
                            apiary.Id,
                            apiary.IdentificationNumber ?? "—",
                            apiary.Name),
                        new RelocationApiaryStayResponse(
                            stay.Id,
                            stay.StartedAtUtc,
                            stay.EndedAtUtc,
                            stay.Orientation,
                            stay.Note),
                        new RelocationLocationResponse(
                            location.Id,
                            location.Name,
                            location.Description,
                            location.AltitudeMeters,
                            location.CadastralParcelNumber,
                            location.Latitude,
                            location.Longitude));
                }

                return Results.Ok(new RelocationDetailsResponse(
                    relocation.Id,
                    relocation.Kind,
                    relocation.OccurredAtUtc,
                    relocation.TransportMethod,
                    relocation.DistanceKm,
                    relocation.CostAmount,
                    relocation.CurrencyCode,
                    relocation.Notes,
                    hiveCount,
                    ToPlace(originApiaryId, originApiaryStay),
                    ToPlace(destinationApiaryId, destinationApiaryStay)));
            });

        return endpoints;
    }
}

public sealed record RelocationDetailsResponse(
    Guid Id,
    RelocationKind Kind,
    DateTimeOffset OccurredAtUtc,
    RelocationTransportMethod TransportMethod,
    decimal? DistanceKm,
    decimal? CostAmount,
    string? CurrencyCode,
    string? Notes,
    int? HiveCount,
    ApiaryRelocationPlaceResponse Origin,
    ApiaryRelocationPlaceResponse Destination);

public sealed record ApiaryRelocationPlaceResponse(
    RelocationApiaryResponse Apiary,
    RelocationApiaryStayResponse Stay,
    RelocationLocationResponse Location);

public sealed record RelocationApiaryResponse(
    Guid Id,
    string IdentificationNumber,
    string? Name);

public sealed record RelocationApiaryStayResponse(
    Guid Id,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset? EndedAtUtc,
    HiveEntranceOrientation? Orientation,
    string? Note);

public sealed record RelocationLocationResponse(
    Guid Id,
    string? Name,
    string? Description,
    int? AltitudeMeters,
    string? CadastralParcelNumber,
    decimal Latitude,
    decimal Longitude);
