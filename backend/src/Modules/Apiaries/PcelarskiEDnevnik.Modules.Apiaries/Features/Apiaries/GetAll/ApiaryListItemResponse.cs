using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.GetAll;

public sealed record ApiaryListItemResponse(
    Guid Id,
    string? IdentificationNumber,
    string? Name,
    string? ImageUrl,
    ApiaryType Type,
    ApiaryStatus? Status,
    DateTimeOffset CreatedAtUtc);
