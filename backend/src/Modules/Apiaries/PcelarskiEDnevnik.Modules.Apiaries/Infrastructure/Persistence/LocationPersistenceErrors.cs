using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

internal static class LocationPersistenceErrors {
    private const string ApiaryStayLocationForeignKey =
        "fk_apiary_stays_locations_location_id";

    public static bool IsLocationInUseViolation(
        DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.ForeignKeyViolation
            &&
            postgresException.ConstraintName ==
                ApiaryStayLocationForeignKey;
    }
}