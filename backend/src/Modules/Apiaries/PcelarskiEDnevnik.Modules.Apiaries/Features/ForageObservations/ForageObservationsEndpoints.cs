using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetById;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetAll;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetByProfile;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.Create;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.Update;

namespace PcelarskiEDnevnik.Modules.Apiaries
    .Features.ForageObservations;

public static class
    ForageObservationsEndpoints {
    public static IEndpointRouteBuilder
        MapForageObservationsEndpoints(
            this IEndpointRouteBuilder endpoints) {
        var group =
            endpoints
                .MapGroup(
                    "/api/forage-observations")
                .WithTags(
                    "Forage Observations")
                .RequireAuthorization();

        group
            .MapCreateForageObservationEndpoint();

        group
            .MapUpdateForageObservationEndpoint();

        group
            .MapGetForageObservationsEndpoint();

        group
            .MapGetForageObservationsByProfileEndpoint();

        group
            .MapGetForageObservationByIdEndpoint();

        return endpoints;
    }
}