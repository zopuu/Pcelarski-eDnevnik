namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public static class ForageProfileRules {
    public const int NameMaxLength = 100;

    public const int NotesMaxLength = 1000;

    public const int ForageTypeMaxLength = 20;

    public const short MinimumRadiusKm = 1;

    public const short MaximumRadiusKm = 4;

    public const short MinimumIntensity = 1;

    public const short MaximumIntensity = 5;

    public const decimal TotalPercentage = 100.00m;

    public const string MinimumPercentageText = "0.01";

    public const string TotalPercentageText = "100.00";

    public const int PercentageDecimalPlaces = 2;

    public const short OtherDefaultIntensity = MinimumIntensity;

    public static bool HasAtMostTwoDecimalPlaces(
        decimal percentage) {
        return decimal.Round(
                   percentage,
                   PercentageDecimalPlaces) ==
               percentage;
    }
}
