using System.Text.RegularExpressions;

namespace PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

public sealed class Queen {
    private Queen() {
    }

    private Queen(
        Guid ownerBeekeeperId,
        string? markingColorHex,
        QueenOrigin? origin,
        string? breeder,
        string? breed,
        DateOnly? emergedOn,
        DateOnly? acquiredOn,
        string? notes) {
        if (ownerBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Owner beekeeper ID cannot be empty.",
                nameof(ownerBeekeeperId));
        }

        Id =
            Guid.NewGuid();

        OwnerBeekeeperId =
            ownerBeekeeperId;

        MarkingColorHex =
            NormalizeColorHex(
                markingColorHex);

        Origin =
            origin;

        Breeder =
            NormalizeOptionalText(
                breeder,
                QueenRules.BreederMaxLength,
                nameof(breeder));

        Breed =
            NormalizeOptionalText(
                breed,
                QueenRules.BreedMaxLength,
                nameof(breed));

        Status =
            QueenStatus.Active;

        EmergedOn =
            emergedOn;

        AcquiredOn =
            acquiredOn;

        Notes =
            NormalizeOptionalText(
                notes,
                QueenRules.NotesMaxLength,
                nameof(notes));

        CreatedAtUtc =
            DateTimeOffset.UtcNow;

        UpdatedAtUtc =
            null;
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid OwnerBeekeeperId {
        get;
        private set;
    }

    public string? MarkingColorHex {
        get;
        private set;
    }

    public QueenOrigin? Origin {
        get;
        private set;
    }

    public string? Breeder {
        get;
        private set;
    }

    public string? Breed {
        get;
        private set;
    }

    public QueenStatus Status {
        get;
        private set;
    }

    public DateOnly? EmergedOn {
        get;
        private set;
    }

    public DateOnly? AcquiredOn {
        get;
        private set;
    }

    public string? Notes {
        get;
        private set;
    }

    public DateTimeOffset CreatedAtUtc {
        get;
        private set;
    }

    public DateTimeOffset? UpdatedAtUtc {
        get;
        private set;
    }

    public static Queen Create(
        Guid ownerBeekeeperId,
        string? markingColorHex,
        QueenOrigin? origin,
        string? breeder,
        string? breed,
        DateOnly? emergedOn,
        DateOnly? acquiredOn,
        string? notes) {
        return new Queen(
            ownerBeekeeperId,
            markingColorHex,
            origin,
            breeder,
            breed,
            emergedOn,
            acquiredOn,
            notes);
    }

    public void Update(
        string? markingColorHex,
        QueenOrigin? origin,
        string? breeder,
        string? breed,
        DateOnly? emergedOn,
        DateOnly? acquiredOn,
        string? notes) {
        MarkingColorHex =
            NormalizeColorHex(
                markingColorHex);

        Origin =
            origin;

        Breeder =
            NormalizeOptionalText(
                breeder,
                QueenRules.BreederMaxLength,
                nameof(breeder));

        Breed =
            NormalizeOptionalText(
                breed,
                QueenRules.BreedMaxLength,
                nameof(breed));

        EmergedOn =
            emergedOn;

        AcquiredOn =
            acquiredOn;

        Notes =
            NormalizeOptionalText(
                notes,
                QueenRules.NotesMaxLength,
                nameof(notes));

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public void MarkDead() {
        EnsureActive();

        Status =
            QueenStatus.Dead;

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public void MarkKilled() {
        EnsureActive();

        Status =
            QueenStatus.Killed;

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public void MarkMissing() {
        EnsureActive();

        Status =
            QueenStatus.Missing;

        UpdatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    private void EnsureActive() {
        if (Status !=
            QueenStatus.Active) {
            throw new InvalidOperationException(
                "Only an active queen can change to a terminal status.");
        }
    }

    private static string?
        NormalizeColorHex(
            string? value) {
        if (string.IsNullOrWhiteSpace(
            value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (!Regex.IsMatch(
            normalized,
            QueenRules.ColorHexPattern)) {
            throw new ArgumentException(
                "Color must be a valid hexadecimal color.");
        }

        return normalized.ToUpperInvariant();
    }

    private static string?
        NormalizeOptionalText(
            string? value,
            int maxLength,
            string parameterName) {
        if (string.IsNullOrWhiteSpace(
            value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (normalized.Length >
            maxLength) {
            throw new ArgumentException(
                $"Value cannot exceed {maxLength} characters.",
                parameterName);
        }

        return normalized;
    }
}