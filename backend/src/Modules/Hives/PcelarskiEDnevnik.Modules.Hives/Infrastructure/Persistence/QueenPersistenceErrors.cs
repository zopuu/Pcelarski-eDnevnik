using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

internal static class QueenPersistenceErrors {
    private const string
        ActiveColonyUniqueIndex =
            "ux_queen_stays_active_colony";

    private const string
        ActiveQueenUniqueIndex =
            "ux_queen_stays_active_queen";

    public static bool IsActiveColonyConflict(
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

    public static bool IsActiveQueenConflict(
        DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                ActiveQueenUniqueIndex;
    }
}