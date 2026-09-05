using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PcelarskiEDnevnik.Modules.Relocations.Infrastructure.Persistence;

internal static class
    RelocationPersistenceErrors {
    private static readonly HashSet<string>
        StayTransitionConstraints =
        [
            "ux_apiary_stays_one_active_per_apiary",

            "ux_hive_stays_active_hive",

            "ux_apiary_relocations_origin_apiary_stay_id",

            "ux_apiary_relocations_destination_apiary_stay_id",

            "ux_hive_relocation_items_origin_hive_stay_id",

            "ux_hive_relocation_items_destination_hive_stay_id"
        ];

    public static bool
        IsStayTransitionConflict(
            DbUpdateException exception) {
        if (exception.InnerException
            is not PostgresException
                postgresException) {
            return false;
        }

        if (postgresException.SqlState !=
            PostgresErrorCodes.UniqueViolation) {
            return false;
        }

        return
            postgresException.ConstraintName
                is not null
            &&
            StayTransitionConstraints.Contains(
                postgresException
                    .ConstraintName);
    }
}