using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Deactivate;

public static class DeactivateApiaryEndpoint {
    public static IEndpointRouteBuilder MapDeactivateApiaryEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/{id:guid}/deactivate",
            async (
                Guid id,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    await using var transaction =
                        await dbContext.Database.BeginTransactionAsync(
                            cancellationToken);

                    var apiary =
                        await dbContext.Apiaries.SingleOrDefaultAsync(
                            x =>
                                x.Id == id &&
                                x.OwnerBeekeeperId == beekeeperId &&
                                x.Status != ApiaryStatus.Inactive,
                            cancellationToken);

                    if (apiary is null) {
                        return Results.NotFound();
                    }

                    var activeStay =
                        await dbContext.ApiaryStays.SingleOrDefaultAsync(
                            x =>
                                x.ApiaryId == id &&
                                x.EndedAtUtc == null,
                            cancellationToken);

                    var deactivatedAtUtc = DateTimeOffset.UtcNow;

                    if (activeStay is not null) {
                        if (deactivatedAtUtc <= activeStay.StartedAtUtc) {
                            deactivatedAtUtc =
                                activeStay.StartedAtUtc.AddTicks(1);
                        }

                        activeStay.Close(deactivatedAtUtc);
                    }

                    apiary.Deactivate(deactivatedAtUtc);

                    await dbContext.SaveChangesAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);

                    return Results.Ok(
                        new DeactivateApiaryResponse(
                            apiary.Id,
                            apiary.Status,
                            apiary.UpdatedAtUtc!.Value));
                });

        return endpoints;
    }
}

public sealed record DeactivateApiaryResponse(
    Guid Id,
    ApiaryStatus? Status,
    DateTimeOffset DeactivatedAtUtc);
