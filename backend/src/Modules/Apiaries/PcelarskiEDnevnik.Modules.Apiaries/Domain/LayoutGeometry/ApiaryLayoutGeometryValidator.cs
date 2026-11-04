namespace PcelarskiEDnevnik.Modules.Apiaries.Domain.LayoutGeometry;

public static class ApiaryLayoutGeometryValidator {
    public const int MinimumGap = 10;

    public const int MaxReportedCollisions = 100;

    public static ApiaryLayoutGeometryValidationResult Validate(
        IEnumerable<ApiaryLayoutHivePlacement> placements) {
        ArgumentNullException.ThrowIfNull(placements);

        var submitted = placements.ToArray();

        if (submitted.Any(placement => placement is null)) {
            throw new ArgumentException(
                "Placements cannot contain null values.",
                nameof(placements));
        }

        var invalidCoordinates = submitted
            .Where(placement => placement.X < 0 || placement.Y < 0)
            .Select(placement => new ApiaryLayoutInvalidCoordinate(
                placement.HiveId,
                placement.X,
                placement.Y))
            .Distinct()
            .OrderBy(coordinate => coordinate.HiveId)
            .ThenBy(coordinate => coordinate.X)
            .ThenBy(coordinate => coordinate.Y)
            .ToArray();

        var groups = submitted
            .GroupBy(placement => placement.HiveId)
            .ToArray();

        var duplicateHiveIds = groups
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .OrderBy(hiveId => hiveId)
            .ToArray();

        // Ambiguous or invalid placements cannot produce meaningful collision pairs.
        var validPlacements = groups
            .Where(group => group.Count() == 1)
            .Select(group => group.Single())
            .Where(placement => placement.X >= 0 && placement.Y >= 0)
            .OrderBy(placement => placement.HiveId)
            .ToArray();

        var collisions = new List<ApiaryLayoutCollision>();

        for (var i = 0; i < validPlacements.Length; i++) {
            var first = validPlacements[i];

            for (var j = i + 1; j < validPlacements.Length; j++) {
                var second = validPlacements[j];

                if (Conflicts(first, second)) {
                    collisions.Add(new ApiaryLayoutCollision(
                        first.HiveId,
                        second.HiveId));

                    if (collisions.Count == MaxReportedCollisions) {
                        return new ApiaryLayoutGeometryValidationResult(
                            invalidCoordinates,
                            duplicateHiveIds,
                            collisions.ToArray());
                    }
                }
            }
        }

        return new ApiaryLayoutGeometryValidationResult(
            invalidCoordinates,
            duplicateHiveIds,
            collisions.ToArray());
    }

    private static bool Conflicts(
        ApiaryLayoutHivePlacement first,
        ApiaryLayoutHivePlacement second) =>
        (long)first.X < (long)second.X + second.Footprint.Width + MinimumGap &&
        (long)second.X < (long)first.X + first.Footprint.Width + MinimumGap &&
        (long)first.Y < (long)second.Y + second.Footprint.Height + MinimumGap &&
        (long)second.Y < (long)first.Y + first.Footprint.Height + MinimumGap;
}
