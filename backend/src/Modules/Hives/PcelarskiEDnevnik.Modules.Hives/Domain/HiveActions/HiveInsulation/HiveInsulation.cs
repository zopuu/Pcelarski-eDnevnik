namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.HiveInsulation;

public sealed class HiveInsulation : HiveAction {
    private HiveInsulation() {
    }

    private HiveInsulation(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        HiveInsulationOperation operation,
        bool paper,
        bool eps,
        bool xps)
        : base(
            HiveActionType.Insulation,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes) {
        if (!Enum.IsDefined(
                operation)) {
            throw new ArgumentOutOfRangeException(
                nameof(operation));
        }

        if (!paper &&
            !eps &&
            !xps) {
            throw new ArgumentException(
                "At least one insulation type must be selected.");
        }

        Operation =
            operation;

        Paper =
            paper;

        Eps =
            eps;

        Xps =
            xps;
    }

    public HiveInsulationOperation Operation {
        get;
        private set;
    }

    public bool Paper {
        get;
        private set;
    }

    public bool Eps {
        get;
        private set;
    }

    public bool Xps {
        get;
        private set;
    }

    public static HiveInsulation Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes,
        HiveInsulationOperation operation,
        bool paper,
        bool eps,
        bool xps) {
        return new HiveInsulation(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes,
            operation,
            paper,
            eps,
            xps);
    }
}
