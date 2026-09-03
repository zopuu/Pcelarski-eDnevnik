namespace PcelarskiEDnevnik.Modules.Apiaries.Domain;

public sealed class ForageProfile {
    private readonly List<ForageProfileItem> _items = [];

    private ForageProfile() {
    }

    private ForageProfile(
        int year,
        short? radiusKm,
        string name,
        string? notes,
        Guid apiaryStayId,
        IEnumerable<ForageProfileItemInput> items) {
        if (year < 1) {
            throw new ArgumentOutOfRangeException(
                nameof(year));
        }

        if (radiusKm.HasValue &&
            (radiusKm.Value <
                ForageProfileRules.MinimumRadiusKm ||
             radiusKm.Value >
                ForageProfileRules.MaximumRadiusKm)) {
            throw new ArgumentOutOfRangeException(
                nameof(radiusKm));
        }

        if (apiaryStayId == Guid.Empty) {
            throw new ArgumentException(
                "Apiary stay ID cannot be empty.",
                nameof(apiaryStayId));
        }

        Id = Guid.NewGuid();
        Year = year;
        RadiusKm = radiusKm;
        Name = NormalizeRequiredText(name);
        Notes = NormalizeOptionalText(notes);
        IsLocked = false;
        ApiaryStayId = apiaryStayId;

        ReplaceItems(items);
    }

    public Guid Id { get; private set; }

    public int Year { get; private set; }

    public short? RadiusKm { get; private set; }

    public string Name { get; private set; } = null!;

    public string? Notes { get; private set; }

    public bool IsLocked { get; private set; }

    public Guid ApiaryStayId { get; private set; }

    public IReadOnlyCollection<ForageProfileItem> Items =>
        _items.AsReadOnly();

    public static ForageProfile Create(
        int year,
        short? radiusKm,
        string name,
        string? notes,
        Guid apiaryStayId,
        IEnumerable<ForageProfileItemInput> items) {
        return new ForageProfile(
            year,
            radiusKm,
            name,
            notes,
            apiaryStayId,
            items);
    }

    public void Update(
        int year,
        short? radiusKm,
        string name,
        string? notes,
        IEnumerable<ForageProfileItemInput> items) {
        if (year < 1) {
            throw new ArgumentOutOfRangeException(
                nameof(year));
        }

        if (radiusKm.HasValue &&
            (radiusKm.Value <
                ForageProfileRules.MinimumRadiusKm ||
             radiusKm.Value >
                ForageProfileRules.MaximumRadiusKm)) {
            throw new ArgumentOutOfRangeException(
                nameof(radiusKm));
        }

        Year = year;
        RadiusKm = radiusKm;
        Name = NormalizeRequiredText(name);
        Notes = NormalizeOptionalText(notes);

        ReplaceItems(items);
    }

    private void ReplaceItems(
        IEnumerable<ForageProfileItemInput> items) {
        ArgumentNullException.ThrowIfNull(items);

        var submittedItems = items.ToArray();

        if (submittedItems.Any(x => x is null)) {
            throw new ArgumentException(
                "Forage profile items cannot be null.",
                nameof(items));
        }

        if (submittedItems.Any(
                x => x.ForageType == ForageType.Other)) {
            throw new ArgumentException(
                "Other is created automatically by the server.",
                nameof(items));
        }

        if (submittedItems.Any(
                x => !Enum.IsDefined(x.ForageType))) {
            throw new ArgumentException(
                "A forage type is invalid.",
                nameof(items));
        }

        if (submittedItems
            .GroupBy(x => x.ForageType)
            .Any(x => x.Count() > 1)) {
            throw new ArgumentException(
                "Forage types must be unique within a profile.",
                nameof(items));
        }

        var totalPercentage = 0m;

        foreach (var item in submittedItems) {
            ForageProfileItem.EnsureValid(item);

            totalPercentage += item.Percentage;
        }

        if (totalPercentage >
            ForageProfileRules.TotalPercentage) {
            throw new ArgumentException(
                "The total percentage cannot exceed 100.00.",
                nameof(items));
        }

        _items.Clear();

        foreach (var item in submittedItems) {
            _items.Add(
                ForageProfileItem.Create(
                    Id,
                    item));
        }

        var otherPercentage =
            ForageProfileRules.TotalPercentage -
            totalPercentage;

        if (otherPercentage > 0) {
            _items.Add(
                ForageProfileItem.Create(
                    Id,
                    new ForageProfileItemInput(
                        ForageType.Other,
                        otherPercentage,
                        ForageProfileRules.OtherDefaultIntensity,
                        null)));
        }
    }

    private static string NormalizeRequiredText(
        string value) {
        if (string.IsNullOrWhiteSpace(value)) {
            throw new ArgumentException(
                "A value is required.",
                nameof(value));
        }

        var normalized = value.Trim();

        if (normalized.Length >
            ForageProfileRules.NameMaxLength) {
            throw new ArgumentException(
                $"Value cannot exceed {ForageProfileRules.NameMaxLength} characters.",
                nameof(value));
        }

        return normalized;
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
