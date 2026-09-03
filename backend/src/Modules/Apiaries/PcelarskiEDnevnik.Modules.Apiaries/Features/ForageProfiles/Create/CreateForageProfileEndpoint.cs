using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles.Create;

public static class CreateForageProfileEndpoint {
    public static IEndpointRouteBuilder MapCreateForageProfileEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            async (
                Guid apiaryId,
                CreateForageProfileRequest request,
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

                    var profileExists =
                        await dbContext.ForageProfiles
                            .AsNoTracking()
                            .AnyAsync(
                                x => x.ApiaryStayId == currentStayId.Value,
                                cancellationToken);

                    if (profileExists) {
                        throw new ConflictException(
                            "forage_profiles.current_stay_already_has_profile",
                            "The current apiary stay already has a forage profile.");
                    }

                    await using var transaction =
                        await dbContext.Database.BeginTransactionAsync(
                            cancellationToken);

                    var profile =
                        ForageProfile.Create(
                            request.Year!.Value,
                            request.RadiusKm,
                            request.Name!,
                            request.Notes,
                            currentStayId.Value,
                            request.Items!
                                .Select(
                                    x => new ForageProfileItemInput(
                                        x.ForageType!.Value,
                                        x.Percentage,
                                        x.Intensity,
                                        x.Notes)));

                    dbContext.ForageProfiles.Add(profile);

                    try {
                        await dbContext.SaveChangesAsync(cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (ForageProfilePersistenceErrors
                            .IsApiaryStayUniqueViolation(exception)) {
                        throw new ConflictException(
                            "forage_profiles.current_stay_already_has_profile",
                            "The current apiary stay already has a forage profile.",
                            exception);
                    }

                    await transaction.CommitAsync(cancellationToken);

                    return Results.Created(
                        $"/api/apiaries/{apiaryId}/forage-profile",
                        ForageProfileResponseMapper.Map(profile));
                });

        return endpoints;
    }
}
