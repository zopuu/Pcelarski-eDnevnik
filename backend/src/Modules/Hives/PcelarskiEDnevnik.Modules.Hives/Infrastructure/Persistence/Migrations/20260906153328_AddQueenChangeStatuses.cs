using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQueenChangeStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_queens_status",
                schema: "hives",
                table: "queens");

            migrationBuilder.DropCheckConstraint(
                name: "ck_queen_stays_end_reason",
                schema: "hives",
                table: "queen_stays");

            migrationBuilder.AddCheckConstraint(
                name: "ck_queens_status",
                schema: "hives",
                table: "queens",
                sql: "\"status\" IN (\r\n    'Active',\r\n    'Dead',\n    'Killed',\n    'Missing',\n    'Sold',\n    'Removed'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_queen_stays_end_reason",
                schema: "hives",
                table: "queen_stays",
                sql: "\"end_reason\" IS NULL\r\nOR \"end_reason\" IN (\r\n    'Replaced',\r\n    'Dead',\r\n    'Killed',\r\n    'Missing',\r\n    'Removed',\r\n    'Swarmed',\n    'ColonyEnded',\n    'Other',\n    'Transferred',\n    'ColonyWithoutQueen'\n)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_queens_status",
                schema: "hives",
                table: "queens");

            migrationBuilder.DropCheckConstraint(
                name: "ck_queen_stays_end_reason",
                schema: "hives",
                table: "queen_stays");

            migrationBuilder.AddCheckConstraint(
                name: "ck_queens_status",
                schema: "hives",
                table: "queens",
                sql: "\"status\" IN (\r\n    'Active',\r\n    'Dead',\r\n    'Killed',\r\n    'Missing'\r\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_queen_stays_end_reason",
                schema: "hives",
                table: "queen_stays",
                sql: "\"end_reason\" IS NULL\r\nOR \"end_reason\" IN (\r\n    'Replaced',\r\n    'Dead',\r\n    'Killed',\r\n    'Missing',\r\n    'Removed',\r\n    'Swarmed',\r\n    'ColonyEnded',\r\n    'Other'\r\n)");
        }
    }
}
