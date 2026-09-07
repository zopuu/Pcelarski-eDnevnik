using PcelarskiEDnevnik.SharedKernel.Storage;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class ImageUploadRulesTests {
    [Theory]
    [InlineData("image/jpeg", ".jpg")]
    [InlineData("image/png", ".png")]
    [InlineData("image/webp", ".webp")]
    public void TryGetFileExtension_AcceptsSupportedImageTypes(
        string contentType,
        string expectedExtension) {
        var isSupported = ImageUploadRules.TryGetFileExtension(
            contentType,
            out var extension);

        Assert.True(isSupported);
        Assert.Equal(expectedExtension, extension);
    }

    [Fact]
    public void TryGetFileExtension_RejectsUnsupportedImageTypes() {
        var isSupported = ImageUploadRules.TryGetFileExtension(
            "image/gif",
            out var extension);

        Assert.False(isSupported);
        Assert.Equal(string.Empty, extension);
    }
}
