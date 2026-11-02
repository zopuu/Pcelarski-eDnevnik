namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetLayout;

public sealed record GetApiaryLayoutResponse(
    Guid LayoutId,
    Guid ApiaryStayId,
    long Version,
    IReadOnlyList<ApiaryLayoutHiveResponse> Hives);

public sealed record ApiaryLayoutHiveResponse(
    Guid Id,
    string Label,
    string? ColorHex,
    string HiveType,
    int? X,
    int? Y);
