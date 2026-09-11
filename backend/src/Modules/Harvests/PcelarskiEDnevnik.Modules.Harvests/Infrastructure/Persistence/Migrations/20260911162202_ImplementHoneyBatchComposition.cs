using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementHoneyBatchComposition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_honey_batch_composition_items_percentage",
                schema: "harvests",
                table: "honey_batch_composition_items");

            migrationBuilder.AlterColumn<string>(
                name: "algorithm_version",
                schema: "harvests",
                table: "honey_batch_compositions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<string>(
                name: "evidence_reference",
                schema: "harvests",
                table: "honey_batch_compositions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "forage_type",
                schema: "harvests",
                table: "honey_batch_composition_items",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateIndex(
                name: "ux_honey_batch_compositions_calculated_batch",
                schema: "harvests",
                table: "honey_batch_compositions",
                column: "honey_batch_id",
                unique: true,
                filter: "determination_method = 'Calculated'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_honey_batch_composition_items_percentage",
                schema: "harvests",
                table: "honey_batch_composition_items",
                sql: "percentage > 0 AND percentage <= 100");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ux_honey_batch_compositions_calculated_batch",
                schema: "harvests",
                table: "honey_batch_compositions");

            migrationBuilder.DropCheckConstraint(
                name: "ck_honey_batch_composition_items_percentage",
                schema: "harvests",
                table: "honey_batch_composition_items");

            migrationBuilder.DropColumn(
                name: "evidence_reference",
                schema: "harvests",
                table: "honey_batch_compositions");

            migrationBuilder.AlterColumn<string>(
                name: "algorithm_version",
                schema: "harvests",
                table: "honey_batch_compositions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "forage_type",
                schema: "harvests",
                table: "honey_batch_composition_items",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddCheckConstraint(
                name: "ck_honey_batch_composition_items_percentage",
                schema: "harvests",
                table: "honey_batch_composition_items",
                sql: "percentage >= 0 AND percentage <= 100");
        }
    }
}
