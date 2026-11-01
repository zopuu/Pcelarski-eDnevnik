namespace PcelarskiEDnevnik.Modules.Apiaries.Domain.LayoutGeometry;

public sealed record ApiaryLayoutInvalidCoordinate(
    Guid HiveId,
    int X,
    int Y);

public sealed record ApiaryLayoutCollision(
    Guid HiveId,
    Guid ConflictingHiveId);

public sealed record ApiaryLayoutGeometryValidationResult(
    IReadOnlyList<ApiaryLayoutInvalidCoordinate> InvalidCoordinates,
    IReadOnlyList<Guid> DuplicateHiveIds,
    IReadOnlyList<ApiaryLayoutCollision> Collisions) {
    public bool IsValid =>
        InvalidCoordinates.Count == 0 &&
        DuplicateHiveIds.Count == 0 &&
        Collisions.Count == 0;
}
