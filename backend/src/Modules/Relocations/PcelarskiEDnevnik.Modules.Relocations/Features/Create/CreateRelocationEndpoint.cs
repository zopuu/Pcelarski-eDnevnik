using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Relocations.Features.Create;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
public static class CreateRelocationEndpoint {
    public static IEndpointRouteBuilder
        MapCreateRelocationEndpoint(
            this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            async (
                CreateRelocationRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                CreateRelocationHandler handler,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    if (request.OccurredAtUtc >
                        DateTimeOffset.UtcNow
                            .AddMinutes(5)) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.OccurredAtUtc)
                                ] =
                                [
                                    "Relocation cannot occur in the future."
                                ]
                            });
                    }

                    var response =
                        await handler.HandleAsync(
                            beekeeperId,
                            request,
                            cancellationToken);

                    return Results.Created(
                        $"/api/relocations/{response.Id}",
                        response);
                });

        return endpoints;
    }
}