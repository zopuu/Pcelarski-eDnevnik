using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence;

internal static class ForageProfilePersistenceErrors {
    private const string ApiaryStayYearUniqueIndex =
        "ux_forage_profiles_apiary_stay_id_year";

    public static bool IsApiaryStayYearUniqueViolation(
        DbUpdateException exception) {
        return exception.InnerException
            is PostgresException postgresException
            &&
            postgresException.SqlState ==
                PostgresErrorCodes.UniqueViolation
            &&
            postgresException.ConstraintName ==
                ApiaryStayYearUniqueIndex;
    }
}
