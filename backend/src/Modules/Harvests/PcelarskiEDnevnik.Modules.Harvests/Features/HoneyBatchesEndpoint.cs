using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.Finalize;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetAll;
using PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches.GetById;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.HoneyBatches;

public static class HoneyBatchesEndpoints {
    public static IEndpointRouteBuilder
        MapHoneyBatchesEndpoints(
            this IEndpointRouteBuilder endpoints) {
        var group =
            endpoints
                .MapGroup(
                    "/api/honey-batches")
                .WithTags(
                    "Honey Batches")
                .RequireAuthorization();

        group.MapGetHoneyBatchesEndpoint();
        group.MapGetHoneyBatchByIdEndpoint();
        group.MapFinalizeHoneyBatchEndpoint();

        return endpoints;
    }
}
