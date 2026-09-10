namespace PcelarskiEDnevnik.Modules.Harvests.Domain;

public sealed class HoneyHarvestItem {
    private HoneyHarvestItem() {
    }

    private HoneyHarvestItem(
        Guid id,
        Guid honeyHarvestId,
        Guid hiveSuperStayId,
        int framesHarvested) {
        HoneyDomainGuards.AgainstEmptyGuid(
            id,
            nameof(id));

        HoneyDomainGuards.AgainstEmptyGuid(
            honeyHarvestId,
            nameof(honeyHarvestId));

        HoneyDomainGuards.AgainstEmptyGuid(
            hiveSuperStayId,
            nameof(hiveSuperStayId));

        Id = id;
        HoneyHarvestId = honeyHarvestId;
        HiveSuperStayId = hiveSuperStayId;

        FramesHarvested =
            HoneyDomainGuards.PositiveInt(
                framesHarvested,
                nameof(framesHarvested));
    }

    public Guid Id {
        get;
        private set;
    }

    public Guid HoneyHarvestId {
        get;
        private set;
    }

    public Guid HiveSuperStayId {
        get;
        private set;
    }

    public int FramesHarvested {
        get;
        private set;
    }

    public static HoneyHarvestItem Create(
        Guid honeyHarvestId,
        Guid hiveSuperStayId,
        int framesHarvested) {
        return new HoneyHarvestItem(
            Guid.NewGuid(),
            honeyHarvestId,
            hiveSuperStayId,
            framesHarvested);
    }
}