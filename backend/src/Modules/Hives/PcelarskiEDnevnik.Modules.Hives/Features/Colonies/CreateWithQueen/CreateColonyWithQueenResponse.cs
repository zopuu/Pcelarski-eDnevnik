namespace PcelarskiEDnevnik.Modules.Hives.Features.Colonies.CreateWithQueen;

public sealed record CreateColonyWithQueenResponse(
    Guid ColonyId,
    Guid ColonyStayId,
    Guid QueenId,
    Guid QueenStayId);