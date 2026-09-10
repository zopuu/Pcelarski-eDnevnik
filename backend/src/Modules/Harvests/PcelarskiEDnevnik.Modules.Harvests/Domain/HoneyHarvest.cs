namespace PcelarskiEDnevnik.Modules.Harvests.Domain;

public sealed class HoneyHarvest {
    private HoneyHarvest() {
    }

    private HoneyHarvest(
        Guid id,
        Guid beekeeperId,
        Guid honeyBatchId,
        DateOnly harvestedOn,
        decimal honeyAmount,
        string unit,
        string? notes) {
        HoneyDomainGuards.AgainstEmptyGuid(
            id,
            nameof(id));

        HoneyDomainGuards.AgainstEmptyGuid(
            beekeeperId,
            nameof(beekeeperId));

        HoneyDomainGuards.AgainstEmptyGuid(
            honeyBatchId,
            nameof(honeyBatchId));

        Id = id;
        BeekeeperId = beekeeperId;
        HoneyBatchId = honeyBatchId;
        HarvestedOn = harvestedOn;

        HoneyAmount =
            HoneyDomainGuards.PositiveAmount(
                honeyAmount,
                nameof(honeyAmount));

        Unit =
            HoneyDomainGuards.Unit(
                unit,
                nameof(unit));

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

    public Guid BeekeeperId {
        get;
        private set;
    }

    public Guid HoneyBatchId {
        get;
        private set;
    }

    public DateOnly HarvestedOn {
        get;
        private set;
    }

    public decimal HoneyAmount {
        get;
        private set;
    }

    public string Unit {
        get;
        private set;
    } = null!;

    public string? Notes {
        get;
        private set;
    }

    public static HoneyHarvest Create(
        Guid beekeeperId,
        Guid honeyBatchId,
        DateOnly harvestedOn,
        decimal honeyAmount,
        string unit,
        string? notes = null) {
        return new HoneyHarvest(
            Guid.NewGuid(),
            beekeeperId,
            honeyBatchId,
            harvestedOn,
            honeyAmount,
            unit,
            notes);
    }

    public void Update(
        DateOnly harvestedOn,
        decimal honeyAmount,
        string unit,
        string? notes) {
        HarvestedOn = harvestedOn;

        HoneyAmount =
            HoneyDomainGuards.PositiveAmount(
                honeyAmount,
                nameof(honeyAmount));

        Unit =
            HoneyDomainGuards.Unit(
                unit,
                nameof(unit));

        Notes =
            HoneyDomainGuards.OptionalText(
                notes,
                HoneyHarvestRules.NotesMaxLength,
                nameof(notes));
    }
}