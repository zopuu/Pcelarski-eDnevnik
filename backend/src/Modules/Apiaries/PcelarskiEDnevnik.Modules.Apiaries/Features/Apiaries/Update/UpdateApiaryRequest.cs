using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Update;

public sealed record UpdateApiaryRequest(
    string? IdentificationNumber,
    string? Name,
    ApiaryType? Type,
    ApiaryStatus? Status);