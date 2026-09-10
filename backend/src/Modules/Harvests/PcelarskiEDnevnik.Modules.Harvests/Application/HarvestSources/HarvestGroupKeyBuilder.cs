using System.Security.Cryptography;
using System.Text;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal static class HarvestGroupKeyBuilder {
    public static string Build(
        string algorithmVersion,
        IEnumerable<Guid>
            hiveSuperStayIds) {
        var ids =
            hiveSuperStayIds
                .OrderBy(x => x)
                .Select(
                    x =>
                        x.ToString("N"));

        var source =
            algorithmVersion +
            "|" +
            string.Join(
                "|",
                ids);

        var bytes =
            SHA256.HashData(
                Encoding.UTF8.GetBytes(
                    source));

        return Convert
            .ToHexString(bytes)
            .ToLowerInvariant()[..24];
    }
}