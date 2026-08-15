using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetById;

public sealed record GetApiaryByIdResponse(
    Guid Id,
    string? IdentificationNumber,
    string? Name,
    ApiaryType? Type,
    ApiaryStatus? Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);