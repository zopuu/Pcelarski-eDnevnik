using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries.Deactivate;

public sealed record DeactivateApiaryResponse(
    Guid Id,
    ApiaryStatus? Status,
    DateTimeOffset DeactivatedAtUtc);
