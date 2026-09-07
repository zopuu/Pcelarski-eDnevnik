using PcelarskiEDnevnik.SharedKernel.Storage;

namespace PcelarskiEDnevnik.Api.Storage;

internal sealed class LocalImageStorage(
    IWebHostEnvironment environment) : IImageStorage {
    public async Task<string> SaveAsync(
        Stream content,
        string fileExtension,
        ImageStorageArea area,
        CancellationToken cancellationToken) {
        var folder = ImageUploadRules.GetFolder(area);
        var webRootPath = environment.WebRootPath
            ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var directoryPath = Path.Combine(webRootPath, "uploads", folder);

        Directory.CreateDirectory(directoryPath);

        var fileName = $"{Guid.NewGuid():N}{fileExtension}";
        var fullPath = Path.Combine(directoryPath, fileName);

        await using var destination = new FileStream(
            fullPath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 81920,
            useAsync: true);

        await content.CopyToAsync(destination, cancellationToken);

        return $"{folder}/{fileName}";
    }

    public Task DeleteAsync(
        string relativePath,
        CancellationToken cancellationToken) {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedPath = relativePath.Replace('/', Path.DirectorySeparatorChar);
        var webRootPath = environment.WebRootPath
            ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var uploadsRoot = Path.GetFullPath(
            Path.Combine(webRootPath, "uploads"));
        var fullPath = Path.GetFullPath(
            Path.Combine(uploadsRoot, normalizedPath));

        if (!fullPath.StartsWith(
                uploadsRoot + Path.DirectorySeparatorChar,
                StringComparison.Ordinal)) {
            throw new InvalidOperationException("The image path is outside uploads.");
        }

        if (File.Exists(fullPath)) {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }
}
