namespace PcelarskiEDnevnik.Modules.Relocations.Domain;

public sealed class HiveRelocation {
    private HiveRelocation() {
    }

    public HiveRelocation(
        Guid relocationId) {
        if (relocationId == Guid.Empty) {
            throw new ArgumentException(
                "Relocation ID is required.");
        }

        RelocationId = relocationId;
    }

    public Guid RelocationId { get; private set; }
}