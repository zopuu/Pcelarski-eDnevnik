using System.ComponentModel.DataAnnotations;

using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.Change;

public sealed record ChangeQueenRequest {
    [Required]
    public DateOnly? ChangedOn { get; init; }

    [EnumDataType(typeof(QueenStayEndReason))]
    public QueenStayEndReason CurrentQueenEndReason { get; init; }

    [EnumDataType(typeof(QueenStatus))]
    public QueenStatus CurrentQueenStatus { get; init; }

    public Guid? ExistingQueenId { get; init; }

    public NewQueenForChangeRequest? NewQueen { get; init; }

    [Required]
    [EnumDataType(typeof(QueenIntroductionMethod))]
    public QueenIntroductionMethod? IntroductionMethod { get; init; }

    [StringLength(QueenStayRules.NotesMaxLength)]
    public string? NewQueenStayNotes { get; init; }
}

public sealed record NewQueenForChangeRequest {
    [RegularExpression(
        QueenRules.ColorHexPattern,
        ErrorMessage = "Marking color must be a valid hexadecimal color.")]
    public string? MarkingColorHex { get; init; }

    [Required]
    [EnumDataType(typeof(QueenOrigin))]
    public QueenOrigin? Origin { get; init; }

    [StringLength(QueenRules.BreederMaxLength)]
    public string? Breeder { get; init; }

    [StringLength(QueenRules.BreedMaxLength)]
    public string? Breed { get; init; }

    public DateOnly? EmergedOn { get; init; }

    public DateOnly? AcquiredOn { get; init; }

    [StringLength(QueenRules.NotesMaxLength)]
    public string? Notes { get; init; }
}
