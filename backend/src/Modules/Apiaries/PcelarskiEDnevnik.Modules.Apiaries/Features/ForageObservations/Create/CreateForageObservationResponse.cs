namespace PcelarskiEDnevnik.Modules.Apiaries
    .Features.ForageObservations.Create;

public sealed record
    CreateForageObservationResponse(
        Guid Id,
        Guid? ForageProfileId);