using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Update;

public sealed record UpdateApiaryResponse(
    Guid Id,
    string? IdentificationNumber,
    string? Name,
    string? ImageUrl,
    ApiaryType Type,
    ApiaryStatus? Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
