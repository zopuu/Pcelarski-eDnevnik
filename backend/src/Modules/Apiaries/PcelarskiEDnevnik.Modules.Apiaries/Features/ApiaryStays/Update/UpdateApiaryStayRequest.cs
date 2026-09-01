using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ApiaryStays.Update;

public sealed record UpdateApiaryStayRequest {
    [EnumDataType(
        typeof(HiveEntranceOrientation),
        ErrorMessage =
            "Invalid hive entrance orientation.")]
    public HiveEntranceOrientation? Orientation { get; init; }
}