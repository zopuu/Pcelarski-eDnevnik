using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

internal static class ForageProfilePersistenceErrors {
    private const string ApiaryStayUniqueIndex =
        "ux_forage_profiles_apiary_stay_id";

    public static bool IsApiaryStayUniqueViolation(
        DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                ApiaryStayUniqueIndex;
    }
}
