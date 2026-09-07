using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Delete;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Create;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetAll;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetById;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Update;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetCurrent;
using PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.GetHistory;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays;

public static class ApiaryStaysEndpoints {
    public static IEndpointRouteBuilder MapApiaryStaysEndpoints(
        this IEndpointRouteBuilder endpoints) {
        var group =
            endpoints
                .MapGroup(
                    "/{apiaryId:guid}/stays")
                .WithTags("Apiary Stays");

        group.MapCreateApiaryStayEndpoint();
        group.MapGetApiaryStaysEndpoint();
        group.MapGetApiaryStayByIdEndpoint();
        group.MapUpdateApiaryStayEndpoint();
        group.MapDeleteApiaryStayEndpoint();
        group.MapGetCurrentApiaryStayEndpoint();
        group.MapGetApiaryStayHistoryEndpoint();

        return endpoints;
    }
}
