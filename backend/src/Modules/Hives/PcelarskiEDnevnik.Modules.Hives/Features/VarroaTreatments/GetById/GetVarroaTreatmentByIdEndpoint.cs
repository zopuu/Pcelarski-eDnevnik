using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.VarroaTreatments.GetById;

public static class GetVarroaTreatmentByIdEndpoint {
    public static RouteGroupBuilder
        MapGetVarroaTreatmentByIdEndpoint(
            this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/varroa-treatments/{treatmentId:guid}",
                HandleAsync)
            .WithName(
                "GetVarroaTreatmentById")
            .Produces<VarroaTreatmentDetailsResponse>()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        Guid hiveId,
        Guid treatmentId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken) {
        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var treatment =
            await dbContext.VarroaTreatments
                .AsNoTracking()
                .Where(
                    treatment =>
                        treatment.Id == treatmentId &&
                        treatment.HiveId == hiveId)
                .Join(
                    dbContext.Hives
                        .AsNoTracking()
                        .Where(
                            hive =>
                                hive.OwnerBeekeeperId ==
                                beekeeperId),
                    treatment =>
                        treatment.HiveId,
                    hive =>
                        hive.Id,
                    (treatment, _) =>
                        new VarroaTreatmentDetailsResponse(
                            treatment.Id,
                            treatment.HiveId,
                            treatment.PerformedAt,
                            treatment.ActionGroupId,
                            treatment.ProductName,
                            treatment.ApplicationMethod,
                            treatment.DoseAmount,
                            treatment.DoseUnit,
                            treatment.ImageUrl,
                            treatment.Notes))
                .SingleOrDefaultAsync(
                    cancellationToken);

        return treatment is null
            ? Results.NotFound()
            : Results.Ok(
                treatment);
    }
}

public sealed record VarroaTreatmentDetailsResponse(
    Guid Id,
    Guid HiveId,
    DateTimeOffset PerformedAt,
    Guid? ActionGroupId,
    string ProductName,
    VarroaApplicationMethod ApplicationMethod,
    decimal DoseAmount,
    VarroaDoseUnit DoseUnit,
    string? ImageUrl,
    string? Notes);
