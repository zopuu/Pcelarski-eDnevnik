using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;

public sealed record CreateApiaryResponse(
    Guid Id,
    string? IdentificationNumber,
    string? Name,
    ApiaryType? Type,
    ApiaryStatus? Status,
    DateTimeOffset CreatedAtUtc);