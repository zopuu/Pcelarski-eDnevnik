namespace PcelarskiEDnevnik.Modules.Relocations.Domain;

public static class RelocationRules {
    public const int
        TransportMethodMaxLength = 20;

    public const int
        CurrencyCodeMaxLength = 3;

    public const int
        NotesMaxLength = 1000;

    public const int
        CostAmountPrecision = 12;

    public const int
        CostAmountScale = 2;

    public const int
        DistanceKmPrecision = 8;

    public const int
        DistanceKmScale = 2;

    public const string
        CurrencyCodePattern =
            @"^[A-Z]{3}$";
    public const int KindMaxLength = 20;
}