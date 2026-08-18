using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Update;

public static class UpdateApiaryEndpoint {
    public static IEndpointRouteBuilder MapUpdateApiaryEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPut(
            "/{id:guid}",
            async (
                Guid id,
                UpdateApiaryRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var apiary =
                        await dbContext.Apiaries
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id == id &&
                                    x.OwnerBeekeeperId == beekeeperId,
                                cancellationToken);

                    if (apiary is null) {
                        return Results.NotFound();
                    }

                    apiary.Update(
                        request.IdentificationNumber,
                        request.Name,
                        request.Type,
                        request.Status);

                    try {
                        await dbContext.SaveChangesAsync(
                            cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (
                            ApiaryPersistenceErrors
                                .IsIdentificationNumberUniqueViolation(
                                    exception)) {
                        throw new ConflictException(
                            "apiaries.identification_number_already_exists",
                            "An apiary with this identification number already exists.",
                            exception);
                    }

                    var response =
                        new UpdateApiaryResponse(
                            apiary.Id,
                            apiary.IdentificationNumber,
                            apiary.Name,
                            apiary.Type,
                            apiary.Status,
                            apiary.CreatedAtUtc,
                            apiary.UpdatedAtUtc);

                    return Results.Ok(response);
                });

        return endpoints;
    }
}