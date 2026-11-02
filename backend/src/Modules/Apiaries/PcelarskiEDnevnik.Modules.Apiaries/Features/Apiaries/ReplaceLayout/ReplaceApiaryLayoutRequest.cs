using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.ReplaceLayout;

public sealed record ReplaceApiaryLayoutRequest {
    [Required]
    public Guid? ExpectedApiaryStayId { get; init; }

    [Required]
    [Range(1, long.MaxValue)]
    public long? ExpectedVersion { get; init; }

    [Required]
    public IReadOnlyList<ReplaceApiaryLayoutPositionRequest?>? Positions { get; init; }
}

public sealed record ReplaceApiaryLayoutPositionRequest {
    [Required]
    public Guid? HiveId { get; init; }

    [Required]
    public int? X { get; init; }

    [Required]
    public int? Y { get; init; }
}
