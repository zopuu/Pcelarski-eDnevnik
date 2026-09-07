namespace PcelarskiEDnevnik.SharedKernel.Storage;

public static class ImageUploadRules {
    public const long MaxFileSizeBytes = 5 * 1024 * 1024;

    public static bool TryGetFileExtension(
        string? contentType,
        out string fileExtension) {
        fileExtension = contentType?.ToLowerInvariant() switch {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => string.Empty
        };

        return fileExtension.Length > 0;
    }

    public static string GetFolder(ImageStorageArea area) => area switch {
        ImageStorageArea.Apiaries => "apiaries",
        ImageStorageArea.ForageObservations => "forage-observations",
        ImageStorageArea.HiveActions => "hive-actions",
        _ => throw new ArgumentOutOfRangeException(nameof(area))
    };
}
