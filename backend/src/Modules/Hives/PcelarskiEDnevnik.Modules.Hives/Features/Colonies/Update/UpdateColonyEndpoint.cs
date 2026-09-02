using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Update;

public static class UpdateColonyEndpoint {
    public static RouteGroupBuilder
        MapUpdateColonyEndpoint(
            this RouteGroupBuilder group) {
        group.MapPut(
            "/{colonyId:guid}",
            async (
                Guid colonyId,
                UpdateColonyRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var colony =
                        await dbContext.Colonies
                            .SingleOrDefaultAsync(
                                x =>
                                    x.Id ==
                                    colonyId &&
                                    x.OwnerBeekeeperId ==
                                    beekeeperId,
                                cancellationToken);

                    if (colony is null) {
                        return Results.NotFound();
                    }

                    colony.Update(
                        request.Origin,
                        request.FormedOn,
                        request.Notes);

                    await dbContext
                        .SaveChangesAsync(
                            cancellationToken);

                    return Results.Ok(
                        new UpdateColonyResponse(
                            colony.Id,
                            colony.Origin,
                            colony.Status,
                            colony.FormedOn,
                            colony.Notes));
                });

        return group;
    }
}