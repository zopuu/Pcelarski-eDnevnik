namespace PcelarskiEDnevnik.Api.Features.Registration;

public sealed record RegisterBeekeeperResponse(
    Guid UserId,
    Guid BeekeeperProfileId,
    string Email);