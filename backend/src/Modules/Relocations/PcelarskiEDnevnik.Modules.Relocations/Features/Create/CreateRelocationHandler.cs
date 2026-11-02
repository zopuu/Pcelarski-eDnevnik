using Microsoft.EntityFrameworkCore;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;
using PcelarskiEDnevnik.Modules.Apiaries.Contracts;
using PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Hives.Domain.Hives;
using PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;
using PcelarskiEDnevnik.Modules.Relocations.Domain;
using PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence;
using PcelarskiEDnevnik.SharedKernel.Errors;

namespace PcelarskiEDnevnik.Modules.Relocations.Features.Create;

internal sealed class CreateRelocationHandler {
    private readonly ApiariesDbContext
        _apiariesDbContext;

    private readonly HivesDbContext
        _hivesDbContext;

    private readonly RelocationsDbContext
        _relocationsDbContext;

    private readonly RelocationTransactionCoordinator
        _transactionCoordinator;

    private readonly IApiaryHiveRelocationLayoutUpdater
        _layoutUpdater;

    public CreateRelocationHandler(
        ApiariesDbContext apiariesDbContext,
        HivesDbContext hivesDbContext,
        RelocationsDbContext relocationsDbContext,
        IApiaryHiveRelocationLayoutUpdater layoutUpdater,
        RelocationTransactionCoordinator
            transactionCoordinator) {
        _apiariesDbContext =
            apiariesDbContext;

        _hivesDbContext =
            hivesDbContext;

        _relocationsDbContext =
            relocationsDbContext;

        _transactionCoordinator =
            transactionCoordinator;

        _layoutUpdater = layoutUpdater;
    }

    public async Task<CreateRelocationResponse>
        HandleAsync(
            Guid beekeeperId,
            CreateRelocationRequest request,
            CancellationToken cancellationToken) {
        try {
            return await
                _transactionCoordinator
                    .ExecuteAsync(
                        ct =>
                            request.Kind switch {
                                RelocationKind.WholeApiary =>
                                    RelocateWholeApiaryAsync(
                                        beekeeperId,
                                        request,
                                        ct),

                                RelocationKind.SelectedHives =>
                                    RelocateHivesAsync(
                                        beekeeperId,
                                        request,
                                        ct),

                                _ =>
                                    throw new
                                        ArgumentOutOfRangeException(
                                            nameof(
                                                request.Kind))
                            },
                        cancellationToken);
        }
        catch (DbUpdateException exception)
            when (
                RelocationPersistenceErrors
                    .IsStayTransitionConflict(
                        exception)) {
            throw new ConflictException(
                "relocations.concurrent_stay_conflict",
                "The relocation could not be completed because the active stay changed.",
                exception);
        }
    }

    private async Task<CreateRelocationResponse>
        RelocateWholeApiaryAsync(
            Guid beekeeperId,
            CreateRelocationRequest request,
            CancellationToken cancellationToken) {
        // Serialize whole-apiary transitions before selecting the active stay.
        var apiary = _apiariesDbContext.Database.IsRelational()
            ? await _apiariesDbContext.Apiaries
                .FromSqlInterpolated($"""
                    SELECT * FROM apiaries.apiaries
                    WHERE id = {request.SourceApiaryId}
                      AND owner_beekeeper_id = {beekeeperId}
                    FOR UPDATE
                    """)
                .SingleOrDefaultAsync(cancellationToken)
            : await _apiariesDbContext.Apiaries.SingleOrDefaultAsync(
                x => x.Id == request.SourceApiaryId &&
                     x.OwnerBeekeeperId == beekeeperId,
                cancellationToken);

        if (apiary is null) {
            throw new NotFoundException(
                "relocations.resource_not_found",
                "The requested resource was not found.");
        }

        if (apiary.Status == ApiaryStatus.Inactive) {
            throw new ConflictException(
                "relocations.apiary_inactive",
                "An inactive apiary cannot be relocated.");
        }

        var destinationLocationId =
            request.DestinationLocationId!.Value;

        var destinationLocation =
            await _apiariesDbContext.Locations
                .SingleOrDefaultAsync(
                    x =>
                        x.Id ==
                        destinationLocationId &&
                        x.OwnerBeekeeperId ==
                        beekeeperId,
                    cancellationToken);

        if (destinationLocation is null) {
            throw new NotFoundException(
                "relocations.destination_location_not_found",
                "The destination location was not found.");
        }

        // Layout PUT holds this row lock until its positions are committed.
        var originStay = _apiariesDbContext.Database.IsRelational()
            ? await _apiariesDbContext.ApiaryStays
                .FromSqlInterpolated($"""
                    SELECT * FROM apiaries.apiary_stays
                    WHERE apiary_id = {apiary.Id} AND ended_at_utc IS NULL
                    FOR UPDATE
                    """)
                .SingleOrDefaultAsync(cancellationToken)
            : await _apiariesDbContext.ApiaryStays.SingleOrDefaultAsync(
                x => x.ApiaryId == apiary.Id && x.EndedAtUtc == null,
                cancellationToken);

        if (originStay is null) {
            throw new ConflictException(
                "relocations.apiary_has_no_active_stay",
                "The apiary has no active stay to relocate.");
        }

        if (originStay.LocationId ==
            destinationLocation.Id) {
            throw new ConflictException(
                "relocations.destination_matches_origin",
                "The destination location is the same as the current location.");
        }

        if (request.OccurredAtUtc <=
            originStay.StartedAtUtc) {
            throw new ConflictException(
                "relocations.invalid_occurrence_date",
                "The relocation must occur after the current stay started.");
        }

        originStay.Close(
            request.OccurredAtUtc);

        /*
         * You said your existing ApiaryStay.Create
         * already performs the creation logic,
         * so keep using it.
         */
        var destinationStay =
            ApiaryStay.Create(
                apiary.Id,
                destinationLocation.Id,
                request.OccurredAtUtc,
                null,
                request.DestinationOrientation!.Value,
                request.DestinationStayNote);

        _apiariesDbContext.ApiaryStays.Add(
            destinationStay);

        var relocation =
            Relocation.Create(
                beekeeperId,
                RelocationKind.WholeApiary,
                request.OccurredAtUtc,
                request.CostAmount,
                request.CurrencyCode,
                request.TransportMethod,
                request.DistanceKm,
                request.Notes);

        _relocationsDbContext.Relocations.Add(
            relocation);

        _relocationsDbContext
            .ApiaryRelocations
            .Add(
                new ApiaryRelocation(
                    relocation.Id,
                    originStay.Id,
                    destinationStay.Id));

        await _apiariesDbContext
            .SaveChangesAsync(
                cancellationToken);

        await _relocationsDbContext
            .SaveChangesAsync(
                cancellationToken);

        return new CreateRelocationResponse(
            relocation.Id);
    }

    private async Task<CreateRelocationResponse>
        RelocateHivesAsync(
            Guid beekeeperId,
            CreateRelocationRequest request,
            CancellationToken cancellationToken) {
        var destinationApiaryId =
            request.DestinationApiaryId!.Value;

        if (destinationApiaryId ==
            request.SourceApiaryId) {
            throw new ConflictException(
                "relocations.destination_matches_origin",
                "The destination apiary must differ from the source apiary.");
        }

        var apiaryIds =
            new[]
            {
                request.SourceApiaryId,
                destinationApiaryId
            };

        var ownedApiaries =
            await _apiariesDbContext.Apiaries
                .AsNoTracking()
                .Where(
                    x =>
                        apiaryIds.Contains(
                            x.Id) &&
                        x.OwnerBeekeeperId ==
                        beekeeperId)
                .Select(
                    x => x.Id)
                .ToListAsync(
                    cancellationToken);

        if (ownedApiaries.Count != 2) {
            throw new NotFoundException(
                "relocations.resource_not_found",
                "The requested resource was not found.");
        }

        /*
         * Both source and destination apiaries
         * need active stays. This means both have
         * a currently defined location.
         */
        var currentApiaryStays =
            await _apiariesDbContext.ApiaryStays
                .AsNoTracking()
                .Where(
                    x =>
                        apiaryIds.Contains(
                            x.ApiaryId) &&
                        x.EndedAtUtc == null)
                .ToListAsync(
                    cancellationToken);
        var sourceApiaryStay =
            currentApiaryStays
                .SingleOrDefault(
                    x =>
                        x.ApiaryId ==
                        request.SourceApiaryId);

                var destinationApiaryStay =
                    currentApiaryStays
                        .SingleOrDefault(
                            x =>
                                x.ApiaryId ==
                                destinationApiaryId);
        if (sourceApiaryStay is null) {
            throw new ConflictException(
                "relocations.source_apiary_has_no_active_stay",
                "The source apiary has no active stay.");
        }

        if (destinationApiaryStay is null) {
            throw new ConflictException(
                "relocations.destination_apiary_has_no_active_stay",
                "The destination apiary has no active stay.");
        }

        var now =
            DateTimeOffset.UtcNow;

        if (request.OccurredAtUtc > now) {
            throw new ConflictException(
                "relocations.occurred_in_future",
                "The relocation date cannot be in the future.");
        }

        if (request.OccurredAtUtc <=
            sourceApiaryStay.StartedAtUtc) {
            throw new ConflictException(
                "relocations.occurred_before_source_current_stay",
                "The relocation date must be after the current source apiary stay started.");
        }

        if (request.OccurredAtUtc <
            destinationApiaryStay.StartedAtUtc) {
            throw new ConflictException(
                "relocations.occurred_before_destination_current_stay",
                "The relocation date cannot be before the current destination apiary stay started.");
        }
        var hiveIds =
            request.HiveIds!
                .Distinct()
                .ToArray();

        var ownedHiveIds =
            await _hivesDbContext.Hives
                .AsNoTracking()
                .Where(
                    x =>
                        hiveIds.Contains(
                            x.Id) &&
                        x.OwnerBeekeeperId ==
                        beekeeperId)
                .Select(
                    x => x.Id)
                .ToListAsync(
                    cancellationToken);

        if (ownedHiveIds.Count !=
            hiveIds.Length) {
            throw new NotFoundException(
                "relocations.resource_not_found",
                "The requested resource was not found.");
        }

        var initialOriginStays =
            await _hivesDbContext.HiveStays
                .AsNoTracking()
                .Where(
                    x =>
                        hiveIds.Contains(
                            x.HiveId) &&
                        x.ApiaryId ==
                            request.SourceApiaryId &&
                        x.EndedAtUtc == null)
                .ToListAsync(
                    cancellationToken);

        if (initialOriginStays.Count !=
            hiveIds.Length) {
            throw new ConflictException(
                "relocations.hive_has_no_active_stay_in_source_apiary",
                "One or more selected hives do not have an active stay in the source apiary.");
        }
        var invalidHiveStay =
            initialOriginStays.Any(
                x =>
                    request.OccurredAtUtc <=
                    x.StartedAtUtc);

                if (invalidHiveStay) {
                    throw new ConflictException(
                        "relocations.occurred_before_current_hive_stay",
                        "The relocation date must be after the current stay of every selected hive started.");
                }

        var lockedStays = await _layoutUpdater.LockCurrentLayoutsAsync(
            request.SourceApiaryId,
            destinationApiaryId,
            cancellationToken);

        if (lockedStays.SourceStayId != sourceApiaryStay.Id ||
            lockedStays.DestinationStayId != destinationApiaryStay.Id) {
            throw new ConflictException(
                "relocations.concurrent_stay_conflict",
                "The relocation could not be completed because an active apiary stay changed.");
        }

        if (request.OccurredAtUtc <= lockedStays.SourceStartedAtUtc) {
            throw new ConflictException(
                "relocations.occurred_before_source_current_stay",
                "The relocation date must be after the current source apiary stay started.");
        }

        if (request.OccurredAtUtc < lockedStays.DestinationStartedAtUtc) {
            throw new ConflictException(
                "relocations.occurred_before_destination_current_stay",
                "The relocation date cannot be before the current destination apiary stay started.");
        }

        // The initial membership read is only a precheck. A prior transfer may
        // have committed while this request waited for the apiary stay locks.
        var originStays = await _hivesDbContext.HiveStays
            .Where(stay => hiveIds.Contains(stay.HiveId) &&
                           stay.ApiaryId == request.SourceApiaryId &&
                           stay.EndedAtUtc == null)
            .ToListAsync(cancellationToken);

        if (originStays.Count != hiveIds.Length) {
            throw new ConflictException(
                "relocations.hive_has_no_active_stay_in_source_apiary",
                "One or more selected hives do not have an active stay in the source apiary.");
        }

        if (originStays.Any(stay => request.OccurredAtUtc <= stay.StartedAtUtc)) {
            throw new ConflictException(
                "relocations.occurred_before_current_hive_stay",
                "The relocation date must be after the current stay of every selected hive started.");
        }

        var relocation =
            Relocation.Create(
                beekeeperId,
                RelocationKind.SelectedHives,
                request.OccurredAtUtc,
                request.CostAmount,
                request.CurrencyCode,
                request.TransportMethod,
                request.DistanceKm,
                request.Notes);

        _relocationsDbContext.Relocations.Add(
            relocation);

        _relocationsDbContext
            .HiveRelocations
            .Add(
                new HiveRelocation(
                    relocation.Id));

        foreach (var originStay
                 in originStays) {
            if (request.OccurredAtUtc <=
                originStay.StartedAtUtc) {
                throw new ConflictException(
                    "relocations.invalid_occurrence_date",
                    "The relocation date must be after every selected hive stay started.");
            }

            originStay.Close(
                request.OccurredAtUtc);

            /*
             * Use your existing HiveStay.Create.
             */
            var destinationStay =
                HiveStay.Create(
                    originStay.HiveId,
                    destinationApiaryId,
                    request.OccurredAtUtc);

            _hivesDbContext.HiveStays.Add(
                destinationStay);

            _relocationsDbContext
                .HiveRelocationItems
                .Add(
                    new HiveRelocationItem(
                        relocation.Id,
                        originStay.Id,
                        destinationStay.Id));
        }

        await _hivesDbContext
            .SaveChangesAsync(
                cancellationToken);

        await _layoutUpdater.ApplyHiveTransferAsync(
            lockedStays,
            hiveIds,
            cancellationToken);

        await _relocationsDbContext
            .SaveChangesAsync(
                cancellationToken);

        return new CreateRelocationResponse(
            relocation.Id);
    }
}
