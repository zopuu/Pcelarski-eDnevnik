using System.Text.RegularExpressions;

namespace PcelarskiEDnevnik.Modules.Hives.Domain.Hives;

public sealed class Hive {
    private Hive() {
    }

    private Hive(
        Guid ownerBeekeeperId,
        string label,
        HiveType type,
        string? identificationNumber,
        string? colorHex,
        DateOnly? manufactureDate,
        string? manufacturer,
        HiveMaterial? material,
        DateOnly? purchaseDate) {
        if (ownerBeekeeperId == Guid.Empty) {
            throw new ArgumentException(
                "Owner beekeeper ID cannot be empty.",
                nameof(ownerBeekeeperId));
        }

        Id = Guid.NewGuid();

        OwnerBeekeeperId = ownerBeekeeperId;

        Label = NormalizeRequiredText(
            label,
            HiveRules.LabelMaxLength,
            nameof(label));

        Type = type;

        IdentificationNumber =
            NormalizeOptionalText(
                identificationNumber,
                HiveRules.IdentificationNumberLength,
                nameof(identificationNumber));

        ColorHex =
            NormalizeColorHex(colorHex);

        ValidateDates(
            manufactureDate,
            purchaseDate);

        ManufactureDate =
            manufactureDate;

        Manufacturer =
            NormalizeOptionalText(
                manufacturer,
                HiveRules.ManufacturerMaxLength,
                nameof(manufacturer));

        Material = material;

        PurchaseDate =
            purchaseDate;

        Status =
            HiveStatus.Active;

        HasFeeder =
            false;

        FeederVolumeMl =
            null;

        Note =
            null;

        CreatedAtUtc =
            DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid OwnerBeekeeperId { get; private set; }

    public string? IdentificationNumber { get; private set; }

    public string Label { get; private set; } = null!;

    public HiveType Type { get; private set; }

    public string? ColorHex { get; private set; }

    public HiveStatus Status { get; private set; }

    public DateOnly? ManufactureDate { get; private set; }

    public string? Manufacturer { get; private set; }

    public HiveMaterial? Material { get; private set; }

    public DateOnly? PurchaseDate { get; private set; }

    public bool HasFeeder { get; private set; }

    public int? FeederVolumeMl { get; private set; }

    public string? Note { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public static Hive Create(
        Guid ownerBeekeeperId,
        string label,
        HiveType type,
        string? identificationNumber,
        string? colorHex,
        DateOnly? manufactureDate,
        string? manufacturer,
        HiveMaterial? material,
        DateOnly? purchaseDate) {
        return new Hive(
            ownerBeekeeperId,
            label,
            type,
            identificationNumber,
            colorHex,
            manufactureDate,
            manufacturer,
            material,
            purchaseDate);
    }

    public void Update(
        string label,
        HiveType type,
        string? identificationNumber,
        string? colorHex,
        DateOnly? manufactureDate,
        string? manufacturer,
        HiveMaterial? material,
        DateOnly? purchaseDate,
        bool hasFeeder,
        int? feederVolumeMl,
        string? note) {
        Label = NormalizeRequiredText(
            label,
            HiveRules.LabelMaxLength,
            nameof(label));

        Type = type;

        IdentificationNumber =
            NormalizeOptionalText(
                identificationNumber,
                HiveRules.IdentificationNumberLength,
                nameof(identificationNumber));

        ColorHex = NormalizeColorHex(colorHex);

        ValidateDates(
            manufactureDate,
            purchaseDate);

        ManufactureDate = manufactureDate;

        Manufacturer = NormalizeOptionalText(
            manufacturer,
            HiveRules.ManufacturerMaxLength,
            nameof(manufacturer));

        Material = material;

        PurchaseDate = purchaseDate;

        HasFeeder = hasFeeder;

        FeederVolumeMl = NormalizeFeederVolume(
            hasFeeder,
            feederVolumeMl);

        Note = NormalizeOptionalText(
            note,
            HiveRules.NoteMaxLength,
            nameof(note));

        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private static string NormalizeRequiredText(
        string value,
        int maxLength,
        string parameterName) {
        if (string.IsNullOrWhiteSpace(value)) {
            throw new ArgumentException(
                "Value cannot be empty.",
                parameterName);
        }

        var normalized =
            value.Trim();

        if (normalized.Length > maxLength) {
            throw new ArgumentException(
                $"Value cannot exceed {maxLength} characters.",
                parameterName);
        }

        return normalized;
    }

    private static string? NormalizeOptionalText(
        string? value,
        int maxLength,
        string parameterName) {
        if (string.IsNullOrWhiteSpace(value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (normalized.Length > maxLength) {
            throw new ArgumentException(
                $"Value cannot exceed {maxLength} characters.",
                parameterName);
        }

        return normalized;
    }

    private static string? NormalizeColorHex(
        string? value) {
        if (string.IsNullOrWhiteSpace(value)) {
            return null;
        }

        var normalized =
            value.Trim();

        if (!Regex.IsMatch(
                normalized,
                HiveRules.ColorHexPattern)) {
            throw new ArgumentException(
                "Color must be a valid hexadecimal color.");
        }

        return normalized.ToUpperInvariant();
    }

    private static void ValidateDates(
        DateOnly? manufactureDate,
        DateOnly? purchaseDate) {
        var today =
            DateOnly.FromDateTime(
                DateTime.UtcNow);

        if (manufactureDate > today) {
            throw new ArgumentException(
                "Manufacture date cannot be in the future.",
                nameof(manufactureDate));
        }

        if (purchaseDate > today) {
            throw new ArgumentException(
                "Purchase date cannot be in the future.",
                nameof(purchaseDate));
        }

        if (manufactureDate > purchaseDate) {
            throw new ArgumentException(
                "Manufacture date cannot be after purchase date.",
                nameof(manufactureDate));
        }
    }

    private static int? NormalizeFeederVolume(
        bool hasFeeder,
        int? feederVolumeMl) {
        if (!hasFeeder) {
            return null;
        }

        if (
            feederVolumeMl is null ||
            feederVolumeMl <= 0) {
            throw new ArgumentException(
                "Feeder volume must be provided when the hive has a feeder.",
                nameof(feederVolumeMl));
        }

        return feederVolumeMl;
    }
}
