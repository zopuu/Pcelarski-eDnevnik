using System.ComponentModel.DataAnnotations;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;
using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.CreateWithQueen;

public sealed record CreateColonyWithQueenRequest {
    [EnumDataType(
        typeof(ColonyOrigin))]
    public ColonyOrigin? ColonyOrigin {
        get;
        init;
    }

    public DateOnly? ColonyFormedOn {
        get;
        init;
    }

    [Required]
    public DateOnly? ColonyStartedOn {
        get;
        init;
    }

    [StringLength(
        ColonyRules.NotesMaxLength)]
    public string? ColonyNotes {
        get;
        init;
    }

    [StringLength(
        ColonyStayRules.NotesMaxLength)]
    public string? ColonyStayNotes {
        get;
        init;
    }

    [RegularExpression(
        QueenRules.ColorHexPattern)]
    public string? QueenMarkingColorHex {
        get;
        init;
    }

    [EnumDataType(
        typeof(QueenOrigin))]
    public QueenOrigin? QueenOrigin {
        get;
        init;
    }

    [StringLength(
        QueenRules.BreederMaxLength)]
    public string? QueenBreeder {
        get;
        init;
    }

    [StringLength(
        QueenRules.BreedMaxLength)]
    public string? QueenBreed {
        get;
        init;
    }

    public DateOnly? QueenEmergedOn {
        get;
        init;
    }

    public DateOnly? QueenAcquiredOn {
        get;
        init;
    }

    [StringLength(
        QueenRules.NotesMaxLength)]
    public string? QueenNotes {
        get;
        init;
    }

    [Required]
    public DateOnly? QueenStartedOn {
        get;
        init;
    }

    [EnumDataType(
        typeof(
            QueenIntroductionMethod))]
    public QueenIntroductionMethod?
        QueenIntroductionMethod {
        get;
        init;
    }

    [EnumDataType(
        typeof(
            QueenIntroductionOutcome))]
    public QueenIntroductionOutcome?
        QueenIntroductionOutcome {
        get;
        init;
    }

    [StringLength(
        QueenStayRules.NotesMaxLength)]
    public string? QueenStayNotes {
        get;
        init;
    }
}