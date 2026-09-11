namespace PcelarskiEDnevnik.Modules.Harvests.Domain;

public sealed class HoneyBatchComposition {
    private HoneyBatchComposition() {
    }

    private HoneyBatchComposition(
        Guid id,
        Guid honeyBatchId,
        string? algorithmVersion,
        DateTimeOffset determinedAt,
        HoneyCompositionDeterminationMethod determinationMethod,
        string? evidenceReference) {
        HoneyDomainGuards.AgainstEmptyGuid(
            id,
            nameof(id));

        HoneyDomainGuards.AgainstEmptyGuid(
            honeyBatchId,
            nameof(honeyBatchId));

        Id = id;
        HoneyBatchId = honeyBatchId;

        switch (determinationMethod) {
            case HoneyCompositionDeterminationMethod.Calculated:
                AlgorithmVersion = HoneyDomainGuards.RequiredText(
                    algorithmVersion!,
                    HoneyHarvestRules.AlgorithmVersionMaxLength,
                    nameof(algorithmVersion));
                EvidenceReference = null;
                break;

            case HoneyCompositionDeterminationMethod.Manual:
                AlgorithmVersion = null;
                EvidenceReference = null;
                break;

            case HoneyCompositionDeterminationMethod.Laboratory:
                AlgorithmVersion = null;
                EvidenceReference = HoneyDomainGuards.RequiredText(
                    evidenceReference!,
                    HoneyHarvestRules.EvidenceReferenceMaxLength,
                    nameof(evidenceReference));
                break;

            default:
                throw new ArgumentOutOfRangeException(
                    nameof(determinationMethod));
        }

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

    public string? AlgorithmVersion {
        get;
        private set;
    }

    public string? EvidenceReference {
        get;
        private set;
    }

    public DateTimeOffset DeterminedAt {
        get;
        private set;
    }

    public HoneyCompositionDeterminationMethod
        DeterminationMethod {
        get;
        private set;
    }

    public static HoneyBatchComposition CreateCalculated(
        Guid honeyBatchId,
        string algorithmVersion,
        DateTimeOffset determinedAt) {
        return new HoneyBatchComposition(
            Guid.NewGuid(),
            honeyBatchId,
            algorithmVersion,
            determinedAt,
            HoneyCompositionDeterminationMethod.Calculated,
            null);
    }

    public static HoneyBatchComposition CreateManual(
        Guid honeyBatchId,
        DateTimeOffset determinedAt) {
        return new HoneyBatchComposition(
            Guid.NewGuid(),
            honeyBatchId,
            null,
            determinedAt,
            HoneyCompositionDeterminationMethod.Manual,
            null);
    }

    public static HoneyBatchComposition CreateLaboratory(
        Guid honeyBatchId,
        DateTimeOffset determinedAt,
        string evidenceReference) {
        return new HoneyBatchComposition(
            Guid.NewGuid(),
            honeyBatchId,
            null,
            determinedAt,
            HoneyCompositionDeterminationMethod.Laboratory,
            evidenceReference);
    }
}
