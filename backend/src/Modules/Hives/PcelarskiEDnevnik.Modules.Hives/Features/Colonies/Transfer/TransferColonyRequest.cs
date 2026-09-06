using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Transfer;

public sealed record TransferColonyRequest {
    [Required(
        ErrorMessage =
            "Destination hive is required.")]
    public Guid? DestinationHiveId {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Transfer date is required.")]
    public DateOnly? TransferredOn {
        get;
        init;
    }
}
