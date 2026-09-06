using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnforceQueenOriginAndIntroductionMethod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_queens_origin",
                schema: "hives",
                table: "queens");

            migrationBuilder.Sql(
                """
                UPDATE hives.queens
                SET origin = 'Unknown'
                WHERE origin IS NULL;

                UPDATE hives.queen_stays
                SET introduction_method = 'Unknown'
                WHERE introduction_method IS NULL;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "origin",
                schema: "hives",
                table: "queens",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "introduction_method",
                schema: "hives",
                table: "queen_stays",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_queens_origin",
                schema: "hives",
                table: "queens",
                sql: "\"origin\" IN (\r\n    'Purchased',\n    'Produced',\n    'Unknown'\n)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_queens_origin",
                schema: "hives",
                table: "queens");

            migrationBuilder.AlterColumn<string>(
                name: "origin",
                schema: "hives",
                table: "queens",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "introduction_method",
                schema: "hives",
                table: "queen_stays",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.Sql(
                """
                UPDATE hives.queens
                SET origin = NULL
                WHERE origin = 'Unknown';
                """);

            migrationBuilder.AddCheckConstraint(
                name: "ck_queens_origin",
                schema: "hives",
                table: "queens",
                sql: "\"origin\" IS NULL\r\nOR \"origin\" IN (\r\n    'Purchased',\r\n    'Produced'\r\n)");
        }
    }
}
