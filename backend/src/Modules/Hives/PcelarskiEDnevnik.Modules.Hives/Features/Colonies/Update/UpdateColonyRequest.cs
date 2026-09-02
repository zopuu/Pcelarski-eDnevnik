using System.ComponentModel.DataAnnotations;

using PcelarskiEDnevnik.Modules.Hives.Domain.Colonies;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Update;

public sealed record UpdateColonyRequest {
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

    [StringLength(
        ColonyRules.NotesMaxLength,
        ErrorMessage =
            "Colony notes are too long.")]
    public string? Notes {
        get;
        init;
    }
}