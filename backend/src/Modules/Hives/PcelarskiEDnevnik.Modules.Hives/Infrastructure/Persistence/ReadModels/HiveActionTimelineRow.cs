using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.ReadModels;

internal sealed class HiveActionTimelineRow {
    public Guid Id { get; init; }

    public Guid HiveId { get; init; }

    public DateTimeOffset PerformedAt { get; init; }

    public HiveActionType ActionType { get; init; }
}
