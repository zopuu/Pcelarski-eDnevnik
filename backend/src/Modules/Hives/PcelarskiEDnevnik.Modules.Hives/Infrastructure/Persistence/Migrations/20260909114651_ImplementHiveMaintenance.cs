using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementHiveMaintenance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "cost_amount",
                schema: "hives",
                table: "hive_maintenance",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "currency_code",
                schema: "hives",
                table: "hive_maintenance",
                type: "character varying(3)",
                maxLength: 3,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "maintenance_type",
                schema: "hives",
                table: "hive_maintenance",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "service_provider",
                schema: "hives",
                table: "hive_maintenance",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_maintenance_cost_amount_non_negative",
                schema: "hives",
                table: "hive_maintenance",
                sql: "\"cost_amount\" IS NULL OR \"cost_amount\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_maintenance_cost_currency_pair",
                schema: "hives",
                table: "hive_maintenance",
                sql: "(\n    \"cost_amount\" IS NULL\n    AND \"currency_code\" IS NULL\n) OR (\n    \"cost_amount\" IS NOT NULL\n    AND \"currency_code\" IS NOT NULL\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_maintenance_currency_code_format",
                schema: "hives",
                table: "hive_maintenance",
                sql: "\"currency_code\" IS NULL OR \"currency_code\" ~ '^[A-Z]{3}$'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_maintenance_maintenance_type",
                schema: "hives",
                table: "hive_maintenance",
                sql: "\"maintenance_type\" IN (\n    'PAINTING',\n    'FLOOR_REPAIR',\n    'LID_REPLACEMENT',\n    'ENTRANCE_REPLACEMENT',\n    'VARROA_SCREEN_INSTALLATION',\n    'DISINFECTION',\n    'REPAIR',\n    'OTHER'\n)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_maintenance_cost_amount_non_negative",
                schema: "hives",
                table: "hive_maintenance");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_maintenance_cost_currency_pair",
                schema: "hives",
                table: "hive_maintenance");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_maintenance_currency_code_format",
                schema: "hives",
                table: "hive_maintenance");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_maintenance_maintenance_type",
                schema: "hives",
                table: "hive_maintenance");

            migrationBuilder.DropColumn(
                name: "cost_amount",
                schema: "hives",
                table: "hive_maintenance");

            migrationBuilder.DropColumn(
                name: "currency_code",
                schema: "hives",
                table: "hive_maintenance");

            migrationBuilder.DropColumn(
                name: "maintenance_type",
                schema: "hives",
                table: "hive_maintenance");

            migrationBuilder.DropColumn(
                name: "service_provider",
                schema: "hives",
                table: "hive_maintenance");
        }
    }
}
