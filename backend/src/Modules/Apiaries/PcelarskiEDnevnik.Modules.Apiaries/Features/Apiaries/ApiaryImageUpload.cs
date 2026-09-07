using Microsoft.AspNetCore.Http;
using PcelarskiEDnevnik.SharedKernel.Storage;

namespace PcelarskiEDnevnik.Modules.Apiaries.Features.Apiaries;

internal static class ApiaryImageUpload {
    public static bool TryValidate(
        IFormFile? image,
        out string? fileExtension,
        out string? error) {
        fileExtension = null;
        error = null;

        if (image is null || image.Length == 0) {
            return true;
        }

        if (image.Length > ImageUploadRules.MaxFileSizeBytes) {
            error = "Image must not exceed 5 MB.";
            return false;
        }

        if (!ImageUploadRules.TryGetFileExtension(
                image.ContentType,
                out var extension)) {
            error = "Image must be a JPEG, PNG, or WebP file.";
            return false;
        }

        fileExtension = extension;
        return true;
    }

    public static async Task<string?> SaveAsync(
        IFormFile? image,
        string? fileExtension,
        IImageStorage imageStorage,
        CancellationToken cancellationToken) {
        if (image is null || image.Length == 0 || fileExtension is null) {
            return null;
        }

        await using var stream = image.OpenReadStream();

        return await imageStorage.SaveAsync(
            stream,
            fileExtension,
            ImageStorageArea.Apiaries,
            cancellationToken);
    }

    public static string? ToImageUrl(string? imagePath) =>
        imagePath is null ? null : $"/uploads/{imagePath}";
}
