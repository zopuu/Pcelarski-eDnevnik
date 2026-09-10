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
}