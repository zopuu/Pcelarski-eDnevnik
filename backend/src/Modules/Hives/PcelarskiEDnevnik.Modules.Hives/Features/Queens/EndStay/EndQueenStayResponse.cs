using PcelarskiEDnevnik.Modules.Hives.Domain.Queens;

namespace PcelarskiEDnevnik.Modules.Hives.Features.Queens.EndStay;

public sealed record EndQueenStayResponse(
    Guid QueenId,
    Guid QueenStayId,
    DateOnly EndedOn,
    QueenStayEndReason EndReason,
    QueenStatus QueenStatus);
