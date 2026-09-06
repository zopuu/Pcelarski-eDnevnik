using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

internal static class ColonyPersistenceErrors {
    private const string
        ActiveHiveUniqueIndex =
            "ux_colony_stays_active_hive";

    private const string
        ActiveColonyUniqueIndex =
            "ux_colony_stays_active_colony";

    public static bool
        IsActiveHiveConflict(
            DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                ActiveHiveUniqueIndex;
    }

    public static bool
        IsActiveColonyConflict(
            DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                ActiveColonyUniqueIndex;
    }
}
