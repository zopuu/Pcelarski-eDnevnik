namespace PcelarskiEDnevnik.Modules.Relocations.Domain;

public sealed class HiveRelocationItem {
    private HiveRelocationItem() {
    }

    public HiveRelocationItem(
        Guid hiveRelocationId,
        Guid originHiveStayId,
        Guid destinationHiveStayId) {
        Id = Guid.NewGuid();

        HiveRelocationId =
            hiveRelocationId;

        OriginHiveStayId =
            originHiveStayId;

        DestinationHiveStayId =
            destinationHiveStayId;
    }

    public Guid Id { get; private set; }

    public Guid HiveRelocationId { get; private set; }

    public Guid OriginHiveStayId { get; private set; }

    public Guid DestinationHiveStayId { get; private set; }
}