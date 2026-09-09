namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

public sealed class HiveSuperStay {
    private HiveSuperStay() {
    }

    private HiveSuperStay(
        Guid hiveId,
        Guid hiveSuperId,
        DateOnly startedOn) {
        if (hiveId == Guid.Empty) {
            throw new ArgumentException(
                "Hive id cannot be empty.",
                nameof(hiveId));
        }

        if (hiveSuperId == Guid.Empty) {
            throw new ArgumentException(
                "Hive super id cannot be empty.",
                nameof(hiveSuperId));
        }

        Id = Guid.NewGuid();
        HiveId = hiveId;
        HiveSuperId = hiveSuperId;
        StartedOn = startedOn;
    }

    public Guid Id { get; private set; }

    public Guid HiveId { get; private set; }

    public Guid HiveSuperId { get; private set; }

    public DateOnly StartedOn { get; private set; }

    public DateOnly? EndedOn { get; private set; }

    public int? HarvestableFrameCount { get; private set; }

    public int? RemainingHarvestableFrameCount { get; private set; }

    public bool IsActive =>
        EndedOn is null;

    public static HiveSuperStay Create(
        Guid hiveId,
        Guid hiveSuperId,
        DateOnly startedOn) {
        return new HiveSuperStay(
            hiveId,
            hiveSuperId,
            startedOn);
    }

    public void EndForHarvest(
        DateOnly endedOn,
        int harvestableFrameCount) {
        EnsureActive();
        EnsureValidEndDate(endedOn);

        SetHarvestFrameCounts(
            harvestableFrameCount,
            remainingHarvestableFrameCount: 0);

        EndedOn = endedOn;
    }

    public void EndAndArchive(
        DateOnly endedOn) {
        EnsureActive();
        EnsureValidEndDate(endedOn);

        EndedOn = endedOn;
        HarvestableFrameCount = null;
        RemainingHarvestableFrameCount = null;
    }

    private void SetHarvestFrameCounts(
        int harvestableFrameCount,
        int remainingHarvestableFrameCount) {
        if (harvestableFrameCount <= 0) {
            throw new ArgumentOutOfRangeException(
                nameof(harvestableFrameCount),
                harvestableFrameCount,
                "Harvestable frame count must be greater than zero.");
        }

        if (remainingHarvestableFrameCount < 0) {
            throw new ArgumentOutOfRangeException(
                nameof(remainingHarvestableFrameCount),
                remainingHarvestableFrameCount,
                "Remaining harvestable frame count cannot be negative.");
        }

        if (remainingHarvestableFrameCount >
            harvestableFrameCount) {
            throw new ArgumentOutOfRangeException(
                nameof(remainingHarvestableFrameCount),
                remainingHarvestableFrameCount,
                "Remaining harvestable frame count cannot exceed harvestable frame count.");
        }

        HarvestableFrameCount =
            harvestableFrameCount;

        RemainingHarvestableFrameCount =
            remainingHarvestableFrameCount;
    }

    private void EnsureActive() {
        if (!IsActive) {
            throw new InvalidOperationException(
                "Hive super stay is already ended.");
        }
    }

    private void EnsureValidEndDate(
        DateOnly endedOn) {
        if (endedOn < StartedOn) {
            throw new ArgumentOutOfRangeException(
                nameof(endedOn),
                endedOn,
                "End date cannot be before start date.");
        }
    }
}