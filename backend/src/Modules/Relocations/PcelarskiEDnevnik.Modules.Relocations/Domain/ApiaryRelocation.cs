namespace PcelarskiEDnevnik.Modules.Relocations.Domain;

public sealed class ApiaryRelocation {
    private ApiaryRelocation() {
    }

    public ApiaryRelocation(
        Guid relocationId,
        Guid originApiaryStayId,
        Guid destinationApiaryStayId) {
        if (relocationId == Guid.Empty) {
            throw new ArgumentException(
                "Relocation ID is required.");
        }

        if (originApiaryStayId == Guid.Empty) {
            throw new ArgumentException(
                "Origin apiary stay ID is required.");
        }

        if (destinationApiaryStayId == Guid.Empty) {
            throw new ArgumentException(
                "Destination apiary stay ID is required.");
        }

        if (originApiaryStayId ==
            destinationApiaryStayId) {
            throw new ArgumentException(
                "Origin and destination stays must differ.");
        }

        RelocationId = relocationId;
        OriginApiaryStayId = originApiaryStayId;
        DestinationApiaryStayId =
            destinationApiaryStayId;
    }

    public Guid RelocationId { get; private set; }

    public Guid OriginApiaryStayId { get; private set; }

    public Guid DestinationApiaryStayId { get; private set; }
}