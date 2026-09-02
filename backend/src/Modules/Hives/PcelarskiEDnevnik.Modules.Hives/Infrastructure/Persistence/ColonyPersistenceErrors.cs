using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

internal static class ColonyPersistenceErrors {
    private const string
        ActiveHiveUniqueIndex =
            "ux_colony_stays_active_hive";

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
}