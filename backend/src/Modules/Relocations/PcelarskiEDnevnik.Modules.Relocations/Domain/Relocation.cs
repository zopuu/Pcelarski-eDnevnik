namespace PcelarskiEDnevnik.Modules.Relocations.Domain;

public sealed class Relocation {
    private Relocation() {
    }

    private Relocation(
        Guid id,
        Guid beekeeperId,
        RelocationKind relocationKind,
        DateTimeOffset occurredAtUtc,
        decimal? costAmount,
        string? currencyCode,
        string transportMethod,
        decimal? distanceKm,
        string? notes) {
        Id = id;
        BeekeeperId = beekeeperId;
        Kind = relocationKind;
        OccurredAtUtc = occurredAtUtc;
        CostAmount = costAmount;

        CurrencyCode =
            NormalizeOptionalText(currencyCode)?
                .ToUpperInvariant();

        TransportMethod =
            transportMethod.Trim();

        DistanceKm = distanceKm;

        Notes =
            NormalizeOptionalText(notes);

        CreatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid BeekeeperId { get; private set; }

    public DateTimeOffset OccurredAtUtc { get; private set; }

    public decimal? CostAmount { get; private set; }

    public string? CurrencyCode { get; private set; }

    public string TransportMethod { get; private set; } = null!;

    public decimal? DistanceKm { get; private set; }

    public RelocationKind Kind { get; private set; }

    public string? Notes { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public static Relocation Create(
        Guid beekeeperId,
        RelocationKind relocationKind,
        DateTimeOffset occurredAtUtc,
        decimal? costAmount,
        string? currencyCode,
        string transportMethod,
        decimal? distanceKm,
        string? notes) {
        if (beekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Beekeeper ID is required.",
                nameof(beekeeperId));
        }
        if (!Enum.IsDefined(relocationKind)) {
            throw new ArgumentException(
                "Invalid relocation kind.",
                nameof(relocationKind));
        }

        if (string.IsNullOrWhiteSpace(
                transportMethod)) {
            throw new ArgumentException(
                "Transport method is required.",
                nameof(transportMethod));
        }

        return new Relocation(
            Guid.NewGuid(),
            beekeeperId,
            relocationKind,
            occurredAtUtc,
            costAmount,
            currencyCode,
            transportMethod,
            distanceKm,
            notes);
    }

    private static string? NormalizeOptionalText(
        string? value) {
        if (string.IsNullOrWhiteSpace(value)) {
            return null;
        }

        return value.Trim();
    }
}