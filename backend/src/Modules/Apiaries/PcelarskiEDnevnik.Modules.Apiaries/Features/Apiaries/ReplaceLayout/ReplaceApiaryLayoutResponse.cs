namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.ReplaceLayout;

public sealed record ReplaceApiaryLayoutResponse(
    Guid LayoutId,
    Guid ApiaryStayId,
    long Version,
    IReadOnlyList<ReplaceApiaryLayoutPositionResponse> Positions);

public sealed record ReplaceApiaryLayoutPositionResponse(
    Guid HiveId,
    int X,
    int Y);
