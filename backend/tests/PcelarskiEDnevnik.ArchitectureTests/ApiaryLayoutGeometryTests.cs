using PcelarskiEDnevnik.Modules.Apiaries.Domain.LayoutGeometry;

namespace PcelarskiEDnevnik.ArchitectureTests;

public sealed class ApiaryLayoutGeometryTests {
    [Theory]
    [InlineData(89, 0, true)]
    [InlineData(90, 0, false)]
    [InlineData(0, 89, true)]
    [InlineData(0, 90, false)]
    public void Validate_RequiresTenUnitGap(int x, int y, bool expectedCollision) {
        var placements = new[] {
            new ApiaryLayoutHivePlacement(Guid.NewGuid(), 0, 0, HiveFootprintCatalog.Standard),
            new ApiaryLayoutHivePlacement(Guid.NewGuid(), x, y, HiveFootprintCatalog.Standard),
        };

        var result = ApiaryLayoutGeometryValidator.Validate(placements);

        Assert.Equal(expectedCollision, result.Collisions.Count > 0);
    }
}
