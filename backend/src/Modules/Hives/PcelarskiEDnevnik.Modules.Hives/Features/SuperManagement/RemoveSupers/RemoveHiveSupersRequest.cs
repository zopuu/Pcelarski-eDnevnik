using System.ComponentModel.DataAnnotations;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions.SuperManagement;

namespace PcelarskiEDnevnik.Modules.Hives.Features.SuperManagement.RemoveSupers;

public sealed record RemoveHiveSupersRequest {
    [Required]
    [MinLength(
        1,
        ErrorMessage = "At least one super must be selected.")]
    public IReadOnlyList<RemoveHiveSuperItemRequest> Items { get; init; }
        = [];
}

public sealed record RemoveHiveSuperItemRequest {
    public Guid HiveSuperId { get; init; }

    [EnumDataType(
        typeof(SuperManagementOperation),
        ErrorMessage = "Invalid super management operation.")]
    public SuperManagementOperation Operation { get; init; }

    public int? HarvestableFrameCount { get; init; }
}