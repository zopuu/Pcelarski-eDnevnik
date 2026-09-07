using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Create;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Create;

public static class CreateApiaryStayEndpoint {
    public static IEndpointRouteBuilder MapCreateApiaryStayEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            async (
                Guid apiaryId,
                CreateApiaryStayRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var apiaryExists =
                        await dbContext.Apiaries
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.Id == apiaryId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId &&
                                    x.Status == ApiaryStatus.Active,
                                cancellationToken);

                    if (!apiaryExists) {
                        return Results.NotFound();
                    }

                    var locationId =
                        request.LocationId!.Value;

                    var locationExists =
                        await dbContext.Locations
                            .AsNoTracking()
                            .AnyAsync(
                                x =>
                                    x.Id == locationId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    if (!locationExists) {
                        return Results.NotFound();
                    }

                    var startedAtUtc =
                        request.StartedAtUtc!.Value;

                    var overlappingStayExists =
                        await HasOverlappingStayAsync(
                            dbContext,
                            apiaryId,
                            startedAtUtc,
                            request.EndedAtUtc,
                            excludedStayId: null,
                            cancellationToken);

                    if (overlappingStayExists) {
                        throw new ConflictException(
                            "apiary_stays.overlapping_stay",
                            "The apiary already has a stay that overlaps the requested period.");
                    }

                    var stay =
                        ApiaryStay.Create(
                            apiaryId,
                            locationId,
                            startedAtUtc,
                            request.EndedAtUtc,
                            request.Orientation,
                            request.Note);

                    dbContext.ApiaryStays.Add(stay);

                    try {
                        await dbContext.SaveChangesAsync(
                            cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (
                            ApiaryStayPersistenceErrors
                                .IsActiveStayUniqueViolation(
                                    exception)) {
                        throw new ConflictException(
                            "apiary_stays.overlapping_stay",
                            "The apiary already has a stay that overlaps the requested period.",
                            exception);
                    }

                    var response =
                        new CreateApiaryStayResponse(
                            stay.Id,
                            stay.ApiaryId,
                            stay.LocationId,
                            stay.StartedAtUtc,
                            stay.EndedAtUtc,
                            stay.Orientation,
                            stay.Note,
                            stay.IsActive,
                            stay.CreatedAtUtc);

                    return Results.Created(
                        $"/api/apiaries/{apiaryId}/stays/{stay.Id}",
                        response);
                });

        return endpoints;
    }

    private static Task<bool> HasOverlappingStayAsync(
        ApiariesDbContext dbContext,
        Guid apiaryId,
        DateTimeOffset startedAtUtc,
        DateTimeOffset? endedAtUtc,
        Guid? excludedStayId,
        CancellationToken cancellationToken) {
        var query =
            dbContext.ApiaryStays
                .AsNoTracking()
                .Where(
                    x =>
                        x.ApiaryId == apiaryId);

        if (excludedStayId.HasValue) {
            query =
                query.Where(
                    x =>
                        x.Id != excludedStayId.Value);
        }

        if (endedAtUtc.HasValue) {
            return query.AnyAsync(
                x =>
                    x.StartedAtUtc <
                        endedAtUtc.Value
                    &&
                    (
                        x.EndedAtUtc == null ||
                        x.EndedAtUtc >
                            startedAtUtc
                    ),
                cancellationToken);
        }

        return query.AnyAsync(
            x =>
                x.EndedAtUtc == null ||
                x.EndedAtUtc > startedAtUtc,
            cancellationToken);
    }
}
