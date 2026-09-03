using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Hives.Create;

public static class CreateHiveEndpoint {
    public static IEndpointRouteBuilder MapCreateHiveEndpoint(
        this IEndpointRouteBuilder endpoints) {
        endpoints.MapPost(
            "/",
            async (
                Guid apiaryId,
                CreateHiveRequest request,
                ICurrentBeekeeperContext currentBeekeeper,
                IApiaryAccessChecker apiaryAccessChecker,
                HivesDbContext dbContext,
                CancellationToken cancellationToken) => {
                    var beekeeperId =
                        await currentBeekeeper
                            .GetBeekeeperIdAsync(
                                cancellationToken);

                    var canAccessApiary =
                        await apiaryAccessChecker
                            .CanAccessAsync(
                                apiaryId,
                                beekeeperId,
                                cancellationToken);

                    if (!canAccessApiary) {
                        return Results.NotFound();
                    }

                    var today =
                        DateOnly.FromDateTime(
                            DateTime.UtcNow);

                    if (request.ManufactureDate > today) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.ManufactureDate)
                                ] =
                                [
                                    "Manufacture date cannot be in the future."
                                ]
                            });
                    }

                    if (request.PurchaseDate > today) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.PurchaseDate)
                                ] =
                                [
                                    "Purchase date cannot be in the future."
                                ]
                            });
                    }

                    if (
                        request.ManufactureDate >
                        request.PurchaseDate) {
                        return Results.ValidationProblem(
                            new Dictionary<
                                string,
                                string[]> {
                                [
                                    nameof(
                                        request.ManufactureDate)
                                ] =
                                [
                                    "Manufacture date cannot be after purchase date."
                                ]
                            });
                    }

                    var hive =
                        Hive.Create(
                            beekeeperId,
                            request.Label!,
                            request.Type!.Value,
                            request.IdentificationNumber,
                            request.ColorHex,
                            request.ManufactureDate,
                            request.Manufacturer,
                            request.Material,
                            request.PurchaseDate);

                    var stay =
                        HiveStay.Create(
                            hive.Id,
                            apiaryId,
                            DateTimeOffset.UtcNow);

                    dbContext.Hives.Add(
                        hive);

                    dbContext.HiveStays.Add(
                        stay);

                    try {
                        await dbContext.SaveChangesAsync(
                            cancellationToken);
                    }
                    catch (DbUpdateException exception)
                        when (
                            HivePersistenceErrors
                                .IsIdentificationNumberUniqueViolation(
                                    exception)) {
                        throw new ConflictException(
                            "hives.identification_number_already_exists",
                            "A hive with this identification number already exists.",
                            exception);
                    }

                    var response =
                        new CreateHiveResponse(
                            hive.Id,
                            hive.IdentificationNumber,
                            hive.Label,
                            hive.Type,
                            hive.Status,
                            hive.HasFeeder,
                            apiaryId,
                            stay.Id,
                            stay.StartedAtUtc,
                            hive.CreatedAtUtc);

                    return Results.Created(
                        $"/api/hives/{hive.Id}",
                        response);
                });

        return endpoints;
    }
}
