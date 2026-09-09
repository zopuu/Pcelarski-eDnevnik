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

        if (endedOn < StartedOn) {
            throw new ArgumentOutOfRangeException(
                nameof(endedOn),
                endedOn,
                "End date cannot be before start date.");
        }

        if (harvestableFrameCount <
            HiveSuperStayRules.MinimumHarvestableFrameCount) {
            throw new ArgumentOutOfRangeException(
                nameof(harvestableFrameCount),
                harvestableFrameCount,
                "Harvestable frame count must be greater than zero.");
        }

        EndedOn = endedOn;

        HarvestableFrameCount =
            harvestableFrameCount;

        RemainingHarvestableFrameCount =
            harvestableFrameCount;
    }

    public void EndAndArchive(
        DateOnly endedOn) {
        EnsureActive();

        if (endedOn < StartedOn) {
            throw new ArgumentOutOfRangeException(
                nameof(endedOn),
                endedOn,
                "End date cannot be before start date.");
        }

        EndedOn = endedOn;

        HarvestableFrameCount = null;

        RemainingHarvestableFrameCount = null;
    }

    public void ConsumeHarvestedFrames(
        int frameCount) {
        if (frameCount <
            HiveSuperStayRules.MinimumHarvestedFrameCount) {
            throw new ArgumentOutOfRangeException(
                nameof(frameCount),
                frameCount,
                "Harvested frame count must be greater than zero.");
        }

        if (EndedOn is null ||
            HarvestableFrameCount is null ||
            RemainingHarvestableFrameCount is null) {
            throw new InvalidOperationException(
                "Hive super stay was not ended for harvest.");
        }

        if (frameCount >
            RemainingHarvestableFrameCount.Value) {
            throw new InvalidOperationException(
                "Harvested frame count cannot exceed remaining harvestable frame count.");
        }

        RemainingHarvestableFrameCount -=
            frameCount;
    }

    private void EnsureActive() {
        if (!IsActive) {
            throw new InvalidOperationException(
                "Hive super stay is already ended.");
        }
    }
}
