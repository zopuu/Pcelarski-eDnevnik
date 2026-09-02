using System.ComponentModel.DataAnnotations;

using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.Create;

public sealed record CreateQueenRequest {
    [RegularExpression(
        QueenRules.ColorHexPattern,
        ErrorMessage =
            "Marking color must be a valid hexadecimal color.")]
    public string? MarkingColorHex {
        get;
        init;
    }

    [EnumDataType(
        typeof(QueenOrigin),
        ErrorMessage =
            "Invalid queen origin.")]
    public QueenOrigin? Origin {
        get;
        init;
    }

    [StringLength(
        QueenRules.BreederMaxLength)]
    public string? Breeder {
        get;
        init;
    }

    [StringLength(
        QueenRules.BreedMaxLength)]
    public string? Breed {
        get;
        init;
    }

    public DateOnly? EmergedOn {
        get;
        init;
    }

    public DateOnly? AcquiredOn {
        get;
        init;
    }

    [StringLength(
        QueenRules.NotesMaxLength)]
    public string? Notes {
        get;
        init;
    }

    [Required]
    public DateOnly? StartedOn {
        get;
        init;
    }

    [EnumDataType(
        typeof(QueenIntroductionMethod))]
    public QueenIntroductionMethod?
        IntroductionMethod {
        get;
        init;
    }

    [EnumDataType(
        typeof(QueenIntroductionOutcome))]
    public QueenIntroductionOutcome?
        IntroductionOutcome {
        get;
        init;
    }

    [StringLength(
        QueenStayRules.NotesMaxLength)]
    public string? StayNotes {
        get;
        init;
    }
}