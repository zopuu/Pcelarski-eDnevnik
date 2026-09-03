using PcelarskiEDnevnik.Modules.Apiaries.Domain;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.ForageProfiles;

internal static class ForageProfileResponseMapper {
    public static ForageProfileResponse Map(
        ForageProfile profile) {
        var items = profile.Items
            .OrderBy(x => x.ForageType)
            .Select(
                x => new ForageProfileItemResponse(
                    x.Id,
                    x.ForageType,
                    x.Percentage,
                    x.Intensity,
                    x.Notes))
            .ToArray();

        return new ForageProfileResponse(
            profile.Id,
            profile.Year,
            profile.RadiusKm,
            profile.Name,
            profile.Notes,
            profile.IsLocked,
            profile.ApiaryStayId,
            items);
    }
}
