using System.ComponentModel.DataAnnotations;

using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.EndStay;

public sealed record EndQueenStayRequest {
    [Required]
    public DateOnly? EndedOn { get; init; }

    [Required]
    [EnumDataType(typeof(QueenStayEndReason))]
    public QueenStayEndReason? EndReason { get; init; }

    [Required]
    [EnumDataType(typeof(QueenStatus))]
    public QueenStatus? QueenStatus { get; init; }
}
