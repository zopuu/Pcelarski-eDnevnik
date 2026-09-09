using System.Globalization;
using System.Text;

namespace PcelarskiEDnevnik.Modules.Hives.Features.HiveActions.GetHistory;

internal readonly record struct HiveActionHistoryCursor(
    DateTimeOffset PerformedAt,
    Guid Id);

internal static class HiveActionHistoryCursorCodec {
    private const string Version = "v1";

    public static string Encode(
        HiveActionHistoryCursor cursor) {
        var payload =
            $"{Version}|{cursor.PerformedAt.UtcDateTime:O}|{cursor.Id:N}";

        return Convert
            .ToBase64String(
                Encoding.UTF8.GetBytes(
                    payload))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    public static bool TryDecode(
        string value,
        out HiveActionHistoryCursor cursor) {
        cursor = default;

        if (string.IsNullOrWhiteSpace(
                value) ||
            value.Length > 256) {
            return false;
        }

        try {
            var normalized =
                value.Replace('-', '+')
                    .Replace('_', '/');
            var paddingLength =
                (4 - normalized.Length % 4) % 4;
            var payload =
                Encoding.UTF8.GetString(
                    Convert.FromBase64String(
                        normalized.PadRight(
                            normalized.Length + paddingLength,
                            '=')));
            var parts =
                payload.Split(
                    '|');

            if (parts.Length != 3 ||
                parts[0] != Version ||
                !DateTimeOffset.TryParseExact(
                    parts[1],
                    "O",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AssumeUniversal |
                        DateTimeStyles.AdjustToUniversal,
                    out var performedAt) ||
                !Guid.TryParseExact(
                    parts[2],
                    "N",
                    out var id)) {
                return false;
            }

            cursor =
                new HiveActionHistoryCursor(
                    performedAt,
                    id);

            return true;
        } catch (FormatException) {
            return false;
        } catch (DecoderFallbackException) {
            return false;
        }
    }
}
