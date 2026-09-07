using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementSyrupFeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "additives",
                schema: "hives",
                table: "syrup_feedings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "quantity_ml",
                schema: "hives",
                table: "syrup_feedings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "sugar_parts",
                schema: "hives",
                table: "syrup_feedings",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "water_parts",
                schema: "hives",
                table: "syrup_feedings",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddCheckConstraint(
                name: "ck_syrup_feedings_quantity_positive",
                schema: "hives",
                table: "syrup_feedings",
                sql: "quantity_ml > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_syrup_feedings_sugar_parts_positive",
                schema: "hives",
                table: "syrup_feedings",
                sql: "sugar_parts > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_syrup_feedings_water_parts_positive",
                schema: "hives",
                table: "syrup_feedings",
                sql: "water_parts > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_syrup_feedings_quantity_positive",
                schema: "hives",
                table: "syrup_feedings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_syrup_feedings_sugar_parts_positive",
                schema: "hives",
                table: "syrup_feedings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_syrup_feedings_water_parts_positive",
                schema: "hives",
                table: "syrup_feedings");

            migrationBuilder.DropColumn(
                name: "additives",
                schema: "hives",
                table: "syrup_feedings");

            migrationBuilder.DropColumn(
                name: "quantity_ml",
                schema: "hives",
                table: "syrup_feedings");

            migrationBuilder.DropColumn(
                name: "sugar_parts",
                schema: "hives",
                table: "syrup_feedings");

            migrationBuilder.DropColumn(
                name: "water_parts",
                schema: "hives",
                table: "syrup_feedings");
        }
    }
}
