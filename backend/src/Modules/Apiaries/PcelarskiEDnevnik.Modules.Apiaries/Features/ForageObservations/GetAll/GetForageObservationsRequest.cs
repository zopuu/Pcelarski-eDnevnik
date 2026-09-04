using System.ComponentModel.DataAnnotations;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageObservations.GetAll;

public sealed record GetForageObservationsRequest {
    [Range(
        1,
        1_000_000,
        ErrorMessage =
            "Page must be greater than or equal to 1.")]
    public int Page {
        get;
        init;
    } = 1;

    [Range(
        1,
        100,
        ErrorMessage =
            "Page size must be between 1 and 100.")]
    public int PageSize {
        get;
        init;
    } = 50;
}