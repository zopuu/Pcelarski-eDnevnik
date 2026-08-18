using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

internal static class ApiaryPersistenceErrors {
    private const string
        IdentificationNumberUniqueIndex =
            "ux_apiaries_identification_number";

    public static bool
        IsIdentificationNumberUniqueViolation(
            DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                IdentificationNumberUniqueIndex;
    }
}