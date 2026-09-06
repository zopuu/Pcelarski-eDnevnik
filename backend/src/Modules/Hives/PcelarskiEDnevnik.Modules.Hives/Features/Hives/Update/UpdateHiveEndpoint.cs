using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.Update;

public static class UpdateHiveEndpoint {
    public static RouteGroupBuilder MapUpdateHiveEndpoint(
        this RouteGroupBuilder group) {
        group.MapPut(
                "/{hiveId:guid}",
                async (
                    Guid hiveId,
                    UpdateHiveRequest request,
                    ICurrentBeekeeperContext currentBeekeeper,
                    HivesDbContext dbContext,
                    CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper.GetBeekeeperIdAsync(
                            cancellationToken);

                    var hive =
                        await dbContext.Hives.SingleOrDefaultAsync(
                            x =>
                                x.Id == hiveId &&
                                x.OwnerBeekeeperId == beekeeperId,
                            cancellationToken);

                    if (hive is null) {
                        return Results.NotFound();
                    }

                    var validationErrors = Validate(request);

                    if (validationErrors.Count > 0) {
                        return Results.ValidationProblem(
                            validationErrors);
                    }

                    hive.Update(
                        request.Label!,
                        request.Type!.Value,
                        request.IdentificationNumber,
                        request.ColorHex,
                        request.ManufactureDate,
                        request.Manufacturer,
                        request.Material,
                        request.PurchaseDate,
                        request.HasFeeder,
                        request.FeederVolumeMl,
                        request.Note);

                    try {
                        await dbContext.SaveChangesAsync(
                            cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (HivePersistenceErrors
                            .IsIdentificationNumberUniqueViolation(
                                exception)) {
                        throw new ConflictException(
                            "hives.identification_number_already_exists",
                            "A hive with this identification number already exists.",
                            exception);
                    }

                    return Results.Ok(
                        new UpdateHiveResponse(
                            hive.Id,
                            hive.IdentificationNumber,
                            hive.Label,
                            hive.Type,
                            hive.ColorHex,
                            hive.Status,
                            hive.ManufactureDate,
                            hive.Manufacturer,
                            hive.Material,
                            hive.PurchaseDate,
                            hive.HasFeeder,
                            hive.FeederVolumeMl,
                            hive.Note,
                            hive.CreatedAtUtc,
                            hive.UpdatedAtUtc));
                })
            .WithName("UpdateHive")
            .Produces<UpdateHiveResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);

        return group;
    }

    private static Dictionary<string, string[]> Validate(
        UpdateHiveRequest request) {
        var errors = new Dictionary<string, string[]>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (string.IsNullOrWhiteSpace(request.Label)) {
            errors[nameof(request.Label)] =
                ["Hive label is required."];
        }

        if (request.ManufactureDate > today) {
            errors[nameof(request.ManufactureDate)] =
                ["Manufacture date cannot be in the future."];
        }

        if (request.PurchaseDate > today) {
            errors[nameof(request.PurchaseDate)] =
                ["Purchase date cannot be in the future."];
        }

        if (request.ManufactureDate > request.PurchaseDate) {
            errors[nameof(request.ManufactureDate)] =
                ["Manufacture date cannot be after purchase date."];
        }

        if (request.HasFeeder && request.FeederVolumeMl is null) {
            errors[nameof(request.FeederVolumeMl)] =
                ["Feeder volume is required when the hive has a feeder."];
        }

        return errors;
    }
}
