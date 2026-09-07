using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence;

internal static class HivePersistenceErrors {
    private const string
        IdentificationNumberUniqueIndex =
            "ux_hives_identification_number";

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

    public static bool IsSerializationFailure(
        Exception exception) {
        var postgresException =
            exception as PostgresException ??
            exception.InnerException
                as PostgresException;

        return postgresException?.SqlState ==
            PostgresErrorCodes.SerializationFailure;
    }
}
