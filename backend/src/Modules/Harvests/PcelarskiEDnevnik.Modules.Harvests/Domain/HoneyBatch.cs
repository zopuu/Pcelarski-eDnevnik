namespace PcelarskiEDnevnik.Modules.Harvests.Domain;

public sealed class HoneyBatch {
    private HoneyBatch() {
    }

    private HoneyBatch(
        Guid id,
        Guid ownerBeekeeperId,
        string name,
        string batchCode,
        decimal totalAmount,
        string unit,
        DateOnly periodStartedOn,
        DateOnly periodEndedOn,
        string? notes) {
        HoneyDomainGuards.AgainstEmptyGuid(
            id,
            nameof(id));

        HoneyDomainGuards.AgainstEmptyGuid(
            ownerBeekeeperId,
            nameof(ownerBeekeeperId));

        HoneyDomainGuards.ValidPeriod(
            periodStartedOn,
            periodEndedOn);

        Id = id;
        OwnerBeekeeperId = ownerBeekeeperId;

        Name =
            HoneyDomainGuards.RequiredText(
                name,
                HoneyHarvestRules.BatchNameMaxLength,
                nameof(name));

        BatchCode =
            HoneyDomainGuards.RequiredText(
                batchCode,
                HoneyHarvestRules.BatchCodeMaxLength,
                nameof(batchCode));

        TotalAmount =
            HoneyDomainGuards.PositiveAmount(
                totalAmount,
                nameof(totalAmount));

        Unit =
            HoneyDomainGuards.Unit(
                unit,
                nameof(unit));

        PeriodStartedOn = periodStartedOn;
        PeriodEndedOn = periodEndedOn;

        Status = HoneyBatchStatus.Open;

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

    public Guid OwnerBeekeeperId {
        get;
        private set;
    }

    public string Name {
        get;
        private set;
    } = null!;

    public string BatchCode {
        get;
        private set;
    } = null!;

    public HoneyBatchStatus Status {
        get;
        private set;
    }

    public decimal TotalAmount {
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

    public DateOnly PeriodStartedOn {
        get;
        private set;
    }

    public DateOnly PeriodEndedOn {
        get;
        private set;
    }

    public static HoneyBatch Create(
        Guid ownerBeekeeperId,
        string name,
        string batchCode,
        decimal initialAmount,
        string unit,
        DateOnly periodStartedOn,
        DateOnly periodEndedOn,
        string? notes = null) {
        return new HoneyBatch(
            Guid.NewGuid(),
            ownerBeekeeperId,
            name,
            batchCode,
            initialAmount,
            unit,
            periodStartedOn,
            periodEndedOn,
            notes);
    }

    public void RegisterAdditionalHarvest(
        decimal amount,
        string unit,
        DateOnly sourcePeriodStartedOn,
        DateOnly sourcePeriodEndedOn) {
        if (Status != HoneyBatchStatus.Open) {
            throw new InvalidOperationException(
                "A finalized honey batch cannot accept additional harvests.");
        }

        HoneyDomainGuards.ValidPeriod(
            sourcePeriodStartedOn,
            sourcePeriodEndedOn);

        var normalizedUnit =
            HoneyDomainGuards.Unit(
                unit,
                nameof(unit));

        if (!string.Equals(
                Unit,
                normalizedUnit,
                StringComparison.Ordinal)) {
            throw new InvalidOperationException(
                "Harvest unit must match the honey batch unit.");
        }

        TotalAmount +=
            HoneyDomainGuards.PositiveAmount(
                amount,
                nameof(amount));

        if (sourcePeriodStartedOn < PeriodStartedOn) {
            PeriodStartedOn = sourcePeriodStartedOn;
        }

        if (sourcePeriodEndedOn > PeriodEndedOn) {
            PeriodEndedOn = sourcePeriodEndedOn;
        }
    }

    public void UpdateDetails(
        string name,
        string? notes) {
        Name =
            HoneyDomainGuards.RequiredText(
                name,
                HoneyHarvestRules.BatchNameMaxLength,
                nameof(name));

        Notes =
            HoneyDomainGuards.OptionalText(
                notes,
                HoneyHarvestRules.NotesMaxLength,
                nameof(notes));
    }

    public void FinalizeBatch() {
        if (Status == HoneyBatchStatus.Finalized) {
            return;
        }

        Status = HoneyBatchStatus.Finalized;
    }
}