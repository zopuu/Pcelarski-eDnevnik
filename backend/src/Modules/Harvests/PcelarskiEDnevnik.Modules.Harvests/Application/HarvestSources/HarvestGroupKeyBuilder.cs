using System.Security.Cryptography;
using System.Text;

namespace PcelarskiEDnevnik.Modules.Harvests.Application.HarvestSources;

internal static class HarvestGroupKeyBuilder {
    public static string Build(
        string algorithmVersion,
        HarvestSourceGroup group) {
        var builder =
            new StringBuilder();

        builder.Append(
            algorithmVersion);

        foreach (
            var source
            in group.Sources
                .OrderBy(
                    x =>
                        x.SuperStay
                            .HiveSuperStayId)) {
            builder
                .Append('|')
                .Append(
                    source.SuperStay
                        .HiveSuperStayId
                        .ToString("N"))
                .Append(':')
                .Append(
                    source.SuperStay
                        .RemainingHarvestableFrameCount)
                .Append(':')
                .Append(
                    source.SuperStay
                        .StartedOn
                        .ToString("yyyyMMdd"))
                .Append(':')
                .Append(
                    source.SuperStay
                        .EndedOn
                        .ToString("yyyyMMdd"));

            foreach (
                var segment
                in source.EffectiveExposureSegments) {
                builder
                    .Append('[')
                    .Append(
                        segment.StartedOn
                            .ToString("yyyyMMdd"))
                    .Append('-')
                    .Append(
                        segment.EndedOn
                            .ToString("yyyyMMdd"))
                    .Append(':');

                foreach (
                    var locationId
                    in segment.Sources
                        .Select(
                            x =>
                                x.LocationId)
                        .Distinct()
                        .OrderBy(x => x)) {
                    builder.Append(
                        locationId.ToString("N"));
                }

                builder.Append(']');
            }
        }

        var bytes =
            SHA256.HashData(
                Encoding.UTF8.GetBytes(
                    builder.ToString()));

        return Convert
            .ToHexString(bytes)
            .ToLowerInvariant()[..24];
    }
}