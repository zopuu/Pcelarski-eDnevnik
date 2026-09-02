namespace PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

public static class HiveRules {
    public const int IdentificationNumberLength = 10;

    public const int LabelMaxLength = 10;

    public const int ManufacturerMaxLength = 80;

    public const int NoteMaxLength = 2000;

    public const int ColorHexLength = 7;

    public const string IdentificationNumberPattern =
        @"^RS[0-9]{8}$";

    public const string ColorHexPattern =
        @"^#[0-9A-Fa-f]{6}$";
}