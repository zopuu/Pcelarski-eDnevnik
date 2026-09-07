namespace PcelarskiEDnevnik.SharedKernel.Storage;

public interface IImageStorage {
    Task<string> SaveAsync(
        Stream content,
        string fileExtension,
        ImageStorageArea area,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        string relativePath,
        CancellationToken cancellationToken);
}
