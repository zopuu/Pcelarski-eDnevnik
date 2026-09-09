namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

public sealed class SuperManagementItem {
    private SuperManagementItem() {
    }

    private SuperManagementItem(
        Guid superManagementId,
        Guid hiveSuperId,
        SuperManagementOperation operation) {
        if (superManagementId == Guid.Empty) {
            throw new ArgumentException(
                "Super management id cannot be empty.",
                nameof(superManagementId));
        }

        if (hiveSuperId == Guid.Empty) {
            throw new ArgumentException(
                "Hive super id cannot be empty.",
                nameof(hiveSuperId));
        }

        if (!Enum.IsDefined(
                typeof(SuperManagementOperation),
                operation)) {
            throw new ArgumentOutOfRangeException(
                nameof(operation),
                operation,
                "Invalid super management operation.");
        }

        Id = Guid.NewGuid();
        SuperManagementId = superManagementId;
        HiveSuperId = hiveSuperId;
        Operation = operation;
    }

    public Guid Id { get; private set; }

    public Guid SuperManagementId { get; private set; }

    public Guid HiveSuperId { get; private set; }

    public SuperManagementOperation Operation { get; private set; }

    public static SuperManagementItem Create(
        Guid superManagementId,
        Guid hiveSuperId,
        SuperManagementOperation operation) {
        return new SuperManagementItem(
            superManagementId,
            hiveSuperId,
            operation);
    }
}