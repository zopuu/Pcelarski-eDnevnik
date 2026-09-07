using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementPattyFeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "manufacturer",
                schema: "hives",
                table: "patty_feedings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "mass_g",
                schema: "hives",
                table: "patty_feedings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "patty_type",
                schema: "hives",
                table: "patty_feedings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "ck_patty_feedings_mass_positive",
                schema: "hives",
                table: "patty_feedings",
                sql: "mass_g > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_patty_feedings_patty_type",
                schema: "hives",
                table: "patty_feedings",
                sql: "\"patty_type\" IN (\n    'SUGAR',\n    'PROTEIN',\n    'HONEY',\n    'MEDICATED',\n    'INVERT_SUGAR',\n    'OTHER'\n)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_patty_feedings_mass_positive",
                schema: "hives",
                table: "patty_feedings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_patty_feedings_patty_type",
                schema: "hives",
                table: "patty_feedings");

            migrationBuilder.DropColumn(
                name: "manufacturer",
                schema: "hives",
                table: "patty_feedings");

            migrationBuilder.DropColumn(
                name: "mass_g",
                schema: "hives",
                table: "patty_feedings");

            migrationBuilder.DropColumn(
                name: "patty_type",
                schema: "hives",
                table: "patty_feedings");
        }
    }
}
