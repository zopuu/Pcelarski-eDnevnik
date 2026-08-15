using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;

public static class CreateApiaryEndpoint {
    public static IEndpointRouteBuilder MapCreateApiaryEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            async (
                CreateApiaryRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                ApiariesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var apiary = Apiary.Create(
                        beekeeperId,
                        request.IdentificationNumber,
                        request.Name,
                        request.Type,
                        request.Status);

                    dbContext.Apiaries.Add(apiary);

                    await dbContext.SaveChangesAsync(
                        cancellationToken);

                    var response =
                        new CreateApiaryResponse(
                            apiary.Id,
                            apiary.IdentificationNumber,
                            apiary.Name,
                            apiary.Type,
                            apiary.Status,
                            apiary.CreatedAtUtc);

                    return Results.Created(
                        $"/api/apiaries/{apiary.Id}",
                        response);
                });

                return endpoints;
    }
}