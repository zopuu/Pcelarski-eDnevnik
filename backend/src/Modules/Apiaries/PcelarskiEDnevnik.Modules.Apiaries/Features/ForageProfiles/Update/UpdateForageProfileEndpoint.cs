using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.Update;

public static class UpdateForageProfileEndpoint {
    public static IEndpointRouteBuilder MapUpdateForageProfileEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut(
            "/{forageProfileId:guid}",
            async (
                Guid apiaryId,
                Guid forageProfileId,
                UpdateForageProfileRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(cancellationToken);

                    var currentStayId =
                        await ForageProfileCurrentStayQuery.FindIdAsync(
                            dbContext,
                            apiaryId,
                            beekeeperId,
                            cancellationToken);

                    if (!currentStayId.HasValue) {
                        return Results.NotFound();
                    }

                    var profile =
                        await dbContext.ForageProfiles
                            .Include(x => x.Items)
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == forageProfileId &&
                                    x.ApiaryStayId == currentStayId.Value,
                                cancellationToken);

                    if (profile is null) {
                        return Results.NotFound();
                    }

                    var existingItems = profile.Items.ToArray();

                    await using var transaction =
                        await dbContext.Database.BeginTransactionAsync(
                            cancellationToken);

                    profile.Update(
                        request.Year!.Value,
                        request.RadiusKm,
                        request.Name!,
                        request.Notes,
                        request.Items!
                            .Select(
                                x => new ForageProfileItemInput(
                                    x.ForageType!.Value,
                                    x.Percentage,
                                    x.Intensity,
                                    x.Notes)));

                    dbContext.ForageProfileItems.RemoveRange(existingItems);
                    dbContext.ForageProfileItems.AddRange(profile.Items);

                    try {
                        await dbContext.SaveChangesAsync(cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (ForageProfilePersistenceErrors
                            .IsApiaryStayYearUniqueViolation(exception)) {
                        throw new ConflictException(
                            "forage_profiles.current_stay_year_already_has_profile",
                            "The current apiary stay already has a forage profile for this year.",
                            exception);
                    }

                    await transaction.CommitAsync(cancellationToken);

                    return Results.Ok(
                        ForageProfileResponseMapper.Map(profile));
                });

        return endpoints;
    }
}
