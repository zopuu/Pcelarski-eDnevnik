using System.ComponentModel.DataAnnotations;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Create;

public sealed record CreateColonyRequest {
    [EnumDataType(
        typeof(ColonyOrigin),
        ErrorMessage =
            "Invalid colony origin.")]
    public ColonyOrigin? Origin {
        get;
        init;
    }

    public DateOnly? FormedOn {
        get;
        init;
    }

    [Required(
        ErrorMessage =
            "Stay start date is required.")]
    public DateOnly? StartedOn {
        get;
        init;
    }

    [StringLength(
        ColonyRules.NotesMaxLength,
        ErrorMessage =
            "Colony notes are too long.")]
    public string? Notes {
        get;
        init;
    }

    [StringLength(
        ColonyStayRules.NotesMaxLength,
        ErrorMessage =
            "Colony stay notes are too long.")]
    public string? StayNotes {
        get;
        init;
    }
}