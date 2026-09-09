using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Authentication;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;

public static class GetHiveActionHistoryEndpoint {
    private const int DefaultLimit = 20;
    private const int MaximumLimit = 50;

    public static RouteGroupBuilder MapGetHiveActionHistoryEndpoint(
        this RouteGroupBuilder group) {
        group.MapGet(
                "/{hiveId:guid}/actions",
                HandleAsync)
            .WithName(
                "GetHiveActionHistory")
            .Produces<HiveActionHistoryPageResponse>()
            .ProducesValidationProblem()
            .Produces(
                StatusCodes.Status404NotFound);

        return group;
    }

    internal static async Task<IResult> HandleAsync(
        Guid hiveId,
        ICurrentBeekeeperContext currentBeekeeper,
        HivesDbContext dbContext,
        CancellationToken cancellationToken,
        string? cursor = null,
        int limit = DefaultLimit) {
        var validationErrors =
            ValidateRequest(
                cursor,
                limit,
                out var decodedCursor);

        if (validationErrors is not null) {
            return Results.ValidationProblem(
                validationErrors);
        }

        var beekeeperId =
            await currentBeekeeper
                .GetBeekeeperIdAsync(
                    cancellationToken);

        var ownsHive =
            await dbContext.Hives
                .AsNoTracking()
                .AnyAsync(
                    hive =>
                        hive.Id == hiveId &&
                        hive.OwnerBeekeeperId == beekeeperId,
                    cancellationToken);

        if (!ownsHive) {
            return Results.NotFound();
        }

        var page =
            await new HiveActionHistoryReader(
                    dbContext)
                .ReadAsync(
                    hiveId,
                    limit,
                    decodedCursor,
                    cancellationToken);

        return Results.Ok(
            page);
    }

    private static Dictionary<string, string[]>? ValidateRequest(
        string? cursor,
        int limit,
        out HiveActionHistoryCursor? decodedCursor) {
        var errors =
            new Dictionary<string, string[]>();

        decodedCursor = null;

        if (limit < 1 ||
            limit > MaximumLimit) {
            errors["limit"] =
            [
                $"Limit must be between 1 and {MaximumLimit}."
            ];
        }

        if (cursor is not null) {
            if (!HiveActionHistoryCursorCodec.TryDecode(
                    cursor,
                    out var parsedCursor)) {
                errors["cursor"] =
                [
                    "Cursor is invalid."
                ];
            } else {
                decodedCursor =
                    parsedCursor;
            }
        }

        return errors.Count == 0
            ? null
            : errors;
    }
}
