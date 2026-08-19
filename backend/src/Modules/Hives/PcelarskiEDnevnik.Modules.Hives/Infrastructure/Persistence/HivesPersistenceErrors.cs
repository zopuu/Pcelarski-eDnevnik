using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

internal static class HivePersistenceErrors {
    private const string
        IdentificationNumberUniqueIndex =
            "ux_hives_owner_identification_number";

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