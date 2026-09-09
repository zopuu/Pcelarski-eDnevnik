using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.GetById;
using PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.Record;

namespace PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments;

public static class VarroaTreatmentEndpoints {
    public static IEndpointRouteBuilder
        MapVarroaTreatmentEndpoints(
            this IEndpointRouteBuilder endpoints) {
        endpoints
            .MapGroup(
                "/api/hive-actions")
            .WithTags(
                "Varroa Treatments")
            .RequireAuthorization()
            .MapRecordVarroaTreatmentEndpoint();

        endpoints
            .MapGroup(
                "/api/hives")
            .WithTags(
                "Varroa Treatments")
            .RequireAuthorization()
            .MapGetVarroaTreatmentByIdEndpoint();

        return endpoints;
    }
}
