using System.Text.Json.Serialization;

namespace PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

public enum PattyType {
    SUGAR,
    PROTEIN,
    HONEY,
    MEDICATED,
    [JsonStringEnumMemberName("invertSugar")]
    INVERT_SUGAR,
    OTHER
}
