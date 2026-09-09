namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

public sealed class SuperManagement : HiveAction {
    private SuperManagement() {
    }

    private SuperManagement(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes)
        : base(
            HiveActionType.SuperManagement,
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes) {
    }

    public static SuperManagement Create(
        Guid hiveId,
        DateTimeOffset performedAt,
        Guid performedByBeekeeperId,
        Guid? actionGroupId,
        string? imageUrl,
        string? notes) {
        return new SuperManagement(
            hiveId,
            performedAt,
            performedByBeekeeperId,
            actionGroupId,
            imageUrl,
            notes);
    }
}
