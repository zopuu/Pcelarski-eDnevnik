using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Create;

public sealed record CreateApiaryRequest(
    string? IdentificationNumber,
    string? Name,
    ApiaryType? Type,
    ApiaryStatus? Status);