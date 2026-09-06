namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.Transfer;

public sealed record TransferColonyResponse(
    Guid ColonyId,
    Guid SourceHiveId,
    Guid DestinationHiveId,
    Guid ClosedColonyStayId,
    Guid NewColonyStayId,
    DateOnly TransferredOn);
