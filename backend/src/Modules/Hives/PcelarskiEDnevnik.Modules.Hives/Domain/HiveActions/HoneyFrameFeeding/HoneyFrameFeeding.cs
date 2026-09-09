namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HoneyFrameFeeding;

public sealed class HoneyFrameFeeding : HiveAction {
    private HoneyFrameFeeding() {
    }

    private HoneyFrameFeeding(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        int frameCount,
        string? frameSource)
        : base(
            HiveActionType.HoneyFrameFeeding,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes) {
        if (frameCount <= 0 ||
            frameCount >
                HoneyFrameFeedingRules.MaximumFrameCount) {
            throw new ArgumentOutOfRangeException(
                nameof(frameCount),
                $"Frame count must be between 1 and {HoneyFrameFeedingRules.MaximumFrameCount}.");
        }

        FrameCount =
            frameCount;

        FrameSource =
            NormalizeFrameSource(
                frameSource);
    }

    public int FrameCount {
        get;
        private set;
    }

    public string? FrameSource {
        get;
        private set;
    }

    public static HoneyFrameFeeding Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        int frameCount,
        string? frameSource) {
        return new HoneyFrameFeeding(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes,
            frameCount,
            frameSource);
    }

    private static string? NormalizeFrameSource(
        string? value) {
        if (string.IsNullOrWhiteSpace(
            value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (normalized.Length >
            HoneyFrameFeedingRules.FrameSourceMaxLength) {
            throw new ArgumentException(
                $"Frame source cannot exceed {HoneyFrameFeedingRules.FrameSourceMaxLength} characters.",
                nameof(value));
        }

        return normalized;
    }
}
