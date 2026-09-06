namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.Change;

public sealed record ChangeQueenResponse(
    Guid PreviousQueenId,
    Guid PreviousQueenStayId,
    Guid QueenId,
    Guid QueenStayId);
