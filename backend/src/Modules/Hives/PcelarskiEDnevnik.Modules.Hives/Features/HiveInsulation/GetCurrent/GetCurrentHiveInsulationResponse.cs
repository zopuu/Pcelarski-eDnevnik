namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveInsulation.GetCurrent;

public sealed record GetCurrentHiveInsulationResponse(
    bool Paper,
    bool Eps,
    bool Xps);
