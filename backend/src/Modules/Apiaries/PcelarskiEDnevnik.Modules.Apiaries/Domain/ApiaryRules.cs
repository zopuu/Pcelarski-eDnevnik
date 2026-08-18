namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public static class ApiaryRules {
    public const int NameMaxLength = 30;

    public const int IdentificationNumberMaxLength = 14;

    public const string IdentificationNumberPattern =
        @"^RS[0-9]{12}$";
}