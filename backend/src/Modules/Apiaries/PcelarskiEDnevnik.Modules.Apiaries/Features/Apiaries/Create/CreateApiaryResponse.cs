using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;

public sealed record CreateApiaryResponse(
    Guid Id,
    string? IdentificationNumber,
    string Name,
    string? ImageUrl,
    ApiaryType Type,
    ApiaryStatus? Status,
    DateTimeOffset CreatedAtUtc);
