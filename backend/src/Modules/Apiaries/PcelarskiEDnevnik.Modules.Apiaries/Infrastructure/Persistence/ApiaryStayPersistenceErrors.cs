using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

internal static class ApiaryStayPersistenceErrors {
    private const string ActiveStayUniqueIndex =
        "ux_apiary_stays_one_active_per_apiary";

    public static bool IsActiveStayUniqueViolation(
        DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                ActiveStayUniqueIndex;
    }
}