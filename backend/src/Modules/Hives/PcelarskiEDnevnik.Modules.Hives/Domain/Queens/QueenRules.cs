namespace PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

public static class QueenRules {
    public const int MarkingColorHexLength =
        7;

    public const int OriginMaxLength =
        20;

    public const int BreederMaxLength =
        100;

    public const int BreedMaxLength =
        100;

    public const int StatusMaxLength =
        20;

    public const int NotesMaxLength =
        1000;

    public const string ColorHexPattern =
        "^#[0-9A-Fa-f]{6}$";
}