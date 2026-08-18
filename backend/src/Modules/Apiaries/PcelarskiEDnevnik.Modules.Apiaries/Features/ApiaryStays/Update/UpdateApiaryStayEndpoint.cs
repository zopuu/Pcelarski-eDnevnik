using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Update;

public static class UpdateApiaryStayEndpoint {
    public static IEndpointRouteBuilder MapUpdateApiaryStayEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut(
            "/{stayId:guid}",
            async (
                Guid apiaryId,
                Guid stayId,
                UpdateApiaryStayRequest request,
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
                                    beekeeperId,
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

                    var stay =
                        await dbContext.ApiaryStays
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == stayId &&
                                    x.ApiaryId == apiaryId,
                                cancellationToken);

                    if (stay is null) {
                        return Results.NotFound();
                    }

                    var startedAtUtc =
                        request.StartedAtUtc!.Value;

                    var overlapQuery =
                        dbContext.ApiaryStays
                            .AsNoTracking()
                            .Where(
                                x =>
                                    x.ApiaryId == apiaryId &&
                                    x.Id != stayId);

                    bool overlappingStayExists;

                    if (request.EndedAtUtc.HasValue) {
                        var endedAtUtc =
                            request.EndedAtUtc.Value;

                        overlappingStayExists =
                            await overlapQuery.AnyAsync(
                                x =>
                                    x.StartedAtUtc <
                                        endedAtUtc
                                    &&
                                    (
                                        x.EndedAtUtc == null ||
                                        x.EndedAtUtc >
                                            startedAtUtc
                                    ),
                                cancellationToken);
                    }
                    else {
                        overlappingStayExists =
                            await overlapQuery.AnyAsync(
                                x =>
                                    x.EndedAtUtc == null ||
                                    x.EndedAtUtc >
                                        startedAtUtc,
                                cancellationToken);
                    }

                    if (overlappingStayExists) {
                        throw new ConflictException(
                            "apiary_stays.overlapping_stay",
                            "The apiary already has another stay that overlaps the requested period.");
                    }

                    stay.Update(
                        locationId,
                        startedAtUtc,
                        request.EndedAtUtc,
                        request.Orientation,
                        request.Note);

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
                            "The apiary already has another stay that overlaps the requested period.",
                            exception);
                    }

                    var response =
                        new UpdateApiaryStayResponse(
                            stay.Id,
                            stay.ApiaryId,
                            stay.LocationId,
                            stay.StartedAtUtc,
                            stay.EndedAtUtc,
                            stay.Orientation,
                            stay.Note,
                            stay.IsActive,
                            stay.CreatedAtUtc,
                            stay.UpdatedAtUtc);

                    return Results.Ok(response);
                });

        return endpoints;
    }
}