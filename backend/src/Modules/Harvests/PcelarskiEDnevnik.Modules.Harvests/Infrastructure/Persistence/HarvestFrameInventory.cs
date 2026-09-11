using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using PcelarskiEDnevnik.Modules.Harvests.Application.HarvestExecution;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence;

internal sealed class HarvestFrameInventory(
    HarvestsDbContext dbContext) {
    public async Task ConsumeAsync(
        IReadOnlyList<HarvestFrameAllocation>
            allocations,
        CancellationToken cancellationToken) {
        if (allocations.Count == 0) {
            throw new ArgumentException(
                "At least one allocation is required.",
                nameof(allocations));
        }

        var transaction =
            dbContext.Database.CurrentTransaction
            ?? throw new InvalidOperationException(
                "Harvest frame consumption requires an active database transaction.");

        var connection =
            dbContext.Database.GetDbConnection();

        var ids =
            allocations
                .Select(
                    x =>
                        x.HiveSuperStayId)
                .Distinct()
                .ToArray();

        var currentCounts =
            await LockAndReadAsync(
                connection,
                transaction,
                ids,
                cancellationToken);

        foreach (var allocation in allocations) {
            if (!currentCounts.TryGetValue(
                    allocation.HiveSuperStayId,
                    out var currentRemaining)) {
                throw SourceChanged();
            }

            if (
                currentRemaining !=
                allocation.ExpectedRemainingFrameCount
                ||
                currentRemaining <
                allocation.FramesHarvested) {
                throw SourceChanged();
            }
        }

        foreach (var allocation in allocations) {
            await ConsumeOneAsync(
                connection,
                transaction,
                allocation,
                cancellationToken);
        }
    }

    private static async Task<
        Dictionary<Guid, int>>
        LockAndReadAsync(
            DbConnection connection,
            IDbContextTransaction transaction,
            Guid[] ids,
            CancellationToken cancellationToken) {
        await using var command =
            connection.CreateCommand();

        command.Transaction =
            transaction.GetDbTransaction();

        command.CommandText =
            """
            SELECT
                hss.id,
                hss.remaining_harvestable_frame_count
            FROM hives.hive_super_stays AS hss
            JOIN hives.hive_supers AS hs
                ON hs.id = hss.hive_super_id
            WHERE hss.id = ANY(@ids)
              AND hs.status = @ready_for_harvest_status
            FOR UPDATE OF hss, hs;
            """;
        AddParameter(
            command,
            "ready_for_harvest_status",
            "ReadyForHarvest");

        var idsParameter =
            command.CreateParameter();

        idsParameter.ParameterName =
            "ids";

        idsParameter.Value =
            ids;

        command.Parameters.Add(
            idsParameter);

        var result =
            new Dictionary<Guid, int>();

        await using var reader =
            await command.ExecuteReaderAsync(
                cancellationToken);

        while (
            await reader.ReadAsync(
                cancellationToken)) {
            var id =
                reader.GetGuid(0);

            if (reader.IsDBNull(1)) {
                throw SourceChanged();
            }

            result[id] =
                reader.GetInt32(1);
        }

        return result;
    }

    private static async Task ConsumeOneAsync(
    DbConnection connection,
    IDbContextTransaction transaction,
    HarvestFrameAllocation allocation,
    CancellationToken cancellationToken) {
        await using var command =
            connection.CreateCommand();

        command.Transaction =
            transaction.GetDbTransaction();

        command.CommandText =
            """
        WITH updated_stay AS (
            UPDATE hives.hive_super_stays
            SET remaining_harvestable_frame_count =
                remaining_harvestable_frame_count
                - @frames
            WHERE id = @id
              AND remaining_harvestable_frame_count =
                  @expected_remaining
              AND remaining_harvestable_frame_count >=
                  @frames
            RETURNING
                hive_super_id,
                remaining_harvestable_frame_count
        ),
        archived_super AS (
            UPDATE hives.hive_supers AS hs
            SET status = @archived_status
            FROM updated_stay AS us
            WHERE hs.id = us.hive_super_id
              AND us.remaining_harvestable_frame_count = 0
              AND hs.status = @ready_for_harvest_status
            RETURNING hs.id
        )
        SELECT
            hive_super_id,
            remaining_harvestable_frame_count
        FROM updated_stay;
        """;

        AddParameter(
            command,
            "id",
            allocation.HiveSuperStayId);

        AddParameter(
            command,
            "frames",
            allocation.FramesHarvested);

        AddParameter(
            command,
            "expected_remaining",
            allocation
                .ExpectedRemainingFrameCount);

        AddParameter(
            command,
            "archived_status",
            "Archived");

        AddParameter(
            command,
            "ready_for_harvest_status",
            "ReadyForHarvest");

        await using var reader =
            await command.ExecuteReaderAsync(
                cancellationToken);

        if (!await reader.ReadAsync(
                cancellationToken)) {
            throw SourceChanged();
        }

        var remaining =
            reader.GetInt32(1);

        if (remaining < 0) {
            throw SourceChanged();
        }
    }

    private static void AddParameter(
        DbCommand command,
        string name,
        object value) {
        var parameter =
            command.CreateParameter();

        parameter.ParameterName =
            name;

        parameter.Value =
            value;

        command.Parameters.Add(
            parameter);
    }

    private static ConflictException
        SourceChanged() {
        return new ConflictException(
            "harvests.source_group_changed",
            "Harvest availability changed. Refresh the available harvest groups and try again.");
    }
}