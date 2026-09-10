namespace PcelarskiEDnevnik.Modules.Harvests.Domain;

public sealed class HoneyBatchComposition {
    private HoneyBatchComposition() {
    }

    private HoneyBatchComposition(
        Guid id,
        Guid honeyBatchId,
        string algorithmVersion,
        DateTimeOffset determinedAt,
        HoneyCompositionDeterminationMethod
            determinationMethod) {
        HoneyDomainGuards.AgainstEmptyGuid(
            id,
            nameof(id));

        HoneyDomainGuards.AgainstEmptyGuid(
            honeyBatchId,
            nameof(honeyBatchId));

        Id = id;
        HoneyBatchId = honeyBatchId;

        AlgorithmVersion =
            HoneyDomainGuards.RequiredText(
                algorithmVersion,
                HoneyHarvestRules
                    .AlgorithmVersionMaxLength,
                nameof(algorithmVersion));

        DeterminedAt = determinedAt;
        DeterminationMethod = determinationMethod;
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid HoneyBatchId {
        get;
        private set;
    }

    public string AlgorithmVersion {
        get;
        private set;
    } = null!;

    public DateTimeOffset DeterminedAt {
        get;
        private set;
    }

    public HoneyCompositionDeterminationMethod
        DeterminationMethod {
        get;
        private set;
    }

    public static HoneyBatchComposition Create(
        Guid honeyBatchId,
        string algorithmVersion,
        DateTimeOffset determinedAt,
        HoneyCompositionDeterminationMethod
            determinationMethod) {
        return new HoneyBatchComposition(
            Guid.NewGuid(),
            honeyBatchId,
            algorithmVersion,
            determinedAt,
            determinationMethod);
    }
}