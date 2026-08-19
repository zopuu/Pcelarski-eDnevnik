using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.SharedKernel.Errors;
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
                    var stayRequest = request.InitialStay;
                    var locationRequest = stayRequest.Location;

                    var apiary = Apiary.Create(
                        beekeeperId,
                        request.IdentificationNumber,
                        request.Name,
                        request.Type,
                        ApiaryStatus.Active);

                    var location = ApiaryLocation.Create(
                        beekeeperId,
                        locationRequest.Name,
                        locationRequest.Latitude!.Value,
                        locationRequest.Longitude!.Value,
                        locationRequest.AltitudeMeters,
                        locationRequest.CadastralParcelNumber,
                        locationRequest.Description);

                    var stay = ApiaryStay.Create(
                        apiary.Id,
                        location.Id,
                        DateTimeOffset.UtcNow,
                        null,
                        orientation: stayRequest.Orientation,
                        note: stayRequest.Note);

                    dbContext.Apiaries.Add(apiary);
                    dbContext.Locations.Add(location);
                    dbContext.ApiaryStays.Add(stay);

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