namespace PcelarskiEDnevnik.Modules.Harvests.Domain;

public sealed class HoneyBatchCompositionItem {
    private HoneyBatchCompositionItem() {
    }

    private HoneyBatchCompositionItem(
        Guid id,
        Guid honeyBatchCompositionId,
        string forageType,
        int percentage,
        string? notes) {
        HoneyDomainGuards.AgainstEmptyGuid(
            id,
            nameof(id));

        HoneyDomainGuards.AgainstEmptyGuid(
            honeyBatchCompositionId,
            nameof(honeyBatchCompositionId));

        Id = id;
        HoneyBatchCompositionId =
            honeyBatchCompositionId;

        ForageType =
            HoneyDomainGuards.RequiredText(
                forageType,
                HoneyHarvestRules.ForageTypeMaxLength,
                nameof(forageType));

        Percentage =
            HoneyDomainGuards.Percentage(
                percentage,
                nameof(percentage));

        Notes =
            HoneyDomainGuards.OptionalText(
                notes,
                HoneyHarvestRules.NotesMaxLength,
                nameof(notes));
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid HoneyBatchCompositionId {
        get;
        private set;
    }

    public string ForageType {
        get;
        private set;
    } = null!;

    public int Percentage {
        get;
        private set;
    }

    public string? Notes {
        get;
        private set;
    }

    public static HoneyBatchCompositionItem Create(
        Guid honeyBatchCompositionId,
        string forageType,
        int percentage,
        string? notes = null) {
        return new HoneyBatchCompositionItem(
            Guid.NewGuid(),
            honeyBatchCompositionId,
            forageType,
            percentage,
            notes);
    }

    public static IReadOnlyList<HoneyBatchCompositionItem>
        CreateValidatedSet(
            Guid honeyBatchCompositionId,
            IReadOnlyCollection<HoneyBatchCompositionItemInput> items) {
        ArgumentNullException.ThrowIfNull(items);

        if (items.Count == 0) {
            throw new ArgumentException(
                "At least one composition item is required.",
                nameof(items));
        }

        var created = items
            .Select(
                item => Create(
                    honeyBatchCompositionId,
                    item.ForageType,
                    item.Percentage,
                    item.Notes))
            .ToList();

        if (created
            .Select(x => x.ForageType)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count() != created.Count) {
            throw new ArgumentException(
                "Forage types must be unique.",
                nameof(items));
        }

        if (created.Sum(x => x.Percentage) != 100) {
            throw new ArgumentException(
                "Composition percentages must total exactly 100.",
                nameof(items));
        }

        return created;
    }
}

public sealed record HoneyBatchCompositionItemInput(
    string ForageType,
    int Percentage,
    string? Notes);
