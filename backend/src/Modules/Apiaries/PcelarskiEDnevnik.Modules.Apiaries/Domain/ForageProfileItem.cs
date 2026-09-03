namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class ForageProfileItem {
    private ForageProfileItem() {
    }

    private ForageProfileItem(
        Guid forageProfileId,
        ForageType forageType,
        decimal percentage,
        short intensity,
        string? notes) {
        if (forageProfileId == Guid.Empty) {
            throw new ArgumentException(
                "Forage profile ID cannot be empty.",
                nameof(forageProfileId));
        }

        EnsureValid(
            new ForageProfileItemInput(
                forageType,
                percentage,
                intensity,
                notes));

        Id = Guid.NewGuid();
        ForageProfileId = forageProfileId;
        ForageType = forageType;
        Percentage = percentage;
        Intensity = intensity;
        Notes = NormalizeOptionalText(notes);
    }

    public Guid Id { get; private set; }

    public ForageType ForageType { get; private set; }

    public decimal Percentage { get; private set; }

    public short Intensity { get; private set; }

    public string? Notes { get; private set; }

    public Guid ForageProfileId { get; private set; }

    internal static ForageProfileItem Create(
        Guid forageProfileId,
        ForageProfileItemInput input) {
        ArgumentNullException.ThrowIfNull(input);

        return new ForageProfileItem(
            forageProfileId,
            input.ForageType,
            input.Percentage,
            input.Intensity,
            input.Notes);
    }

    internal static void EnsureValid(
        ForageProfileItemInput input) {
        ArgumentNullException.ThrowIfNull(input);

        if (!Enum.IsDefined(input.ForageType)) {
            throw new ArgumentOutOfRangeException(
                nameof(input.ForageType));
        }

        if (input.Percentage <= 0 ||
            input.Percentage > ForageProfileRules.TotalPercentage ||
            !ForageProfileRules.HasAtMostTwoDecimalPlaces(
                input.Percentage)) {
            throw new ArgumentOutOfRangeException(
                nameof(input.Percentage));
        }

        if (input.Intensity < ForageProfileRules.MinimumIntensity ||
            input.Intensity > ForageProfileRules.MaximumIntensity) {
            throw new ArgumentOutOfRangeException(
                nameof(input.Intensity));
        }

        if (input.Notes is { } notes &&
            notes.Trim().Length >
                ForageProfileRules.NotesMaxLength) {
            throw new ArgumentException(
                $"Value cannot exceed {ForageProfileRules.NotesMaxLength} characters.",
                nameof(input.Notes));
        }
    }

    private static string? NormalizeOptionalText(
        string? value) {
        if (string.IsNullOrWhiteSpace(value)) {
            return null;
        }

        var normalized = value.Trim();

        if (normalized.Length >
            ForageProfileRules.NotesMaxLength) {
            throw new ArgumentException(
                $"Value cannot exceed {ForageProfileRules.NotesMaxLength} characters.",
                nameof(value));
        }

        return normalized;
    }
}
