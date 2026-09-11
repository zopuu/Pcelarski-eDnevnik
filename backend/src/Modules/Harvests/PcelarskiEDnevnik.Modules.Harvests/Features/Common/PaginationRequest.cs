using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Harvests.Features.Common;

public sealed record PaginationRequest {
    [Range(1, int.MaxValue)]
    public int Page {
        get;
        init;
    } = 1;

    [Range(1, 100)]
    public int PageSize {
        get;
        init;
    } = 20;

    public int Skip =>
        checked((Page - 1) * PageSize);
}