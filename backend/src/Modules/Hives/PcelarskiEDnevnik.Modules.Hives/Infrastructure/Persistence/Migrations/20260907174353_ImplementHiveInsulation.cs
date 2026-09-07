using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementHiveInsulation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "eps",
                schema: "hives",
                table: "hive_insulation",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "operation",
                schema: "hives",
                table: "hive_insulation",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "paper",
                schema: "hives",
                table: "hive_insulation",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "xps",
                schema: "hives",
                table: "hive_insulation",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_insulation_operation",
                schema: "hives",
                table: "hive_insulation",
                sql: "\"operation\" IN (\n    'Add',\n    'Remove'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_insulation_type_selected",
                schema: "hives",
                table: "hive_insulation",
                sql: "\"paper\" OR \"eps\" OR \"xps\"");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_insulation_operation",
                schema: "hives",
                table: "hive_insulation");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_insulation_type_selected",
                schema: "hives",
                table: "hive_insulation");

            migrationBuilder.DropColumn(
                name: "eps",
                schema: "hives",
                table: "hive_insulation");

            migrationBuilder.DropColumn(
                name: "operation",
                schema: "hives",
                table: "hive_insulation");

            migrationBuilder.DropColumn(
                name: "paper",
                schema: "hives",
                table: "hive_insulation");

            migrationBuilder.DropColumn(
                name: "xps",
                schema: "hives",
                table: "hive_insulation");
        }
    }
}
