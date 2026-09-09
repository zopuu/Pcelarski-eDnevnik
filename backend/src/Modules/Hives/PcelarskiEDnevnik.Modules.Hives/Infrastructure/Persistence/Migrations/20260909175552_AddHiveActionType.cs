using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHiveActionType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "action_type",
                schema: "hives",
                table: "hive_actions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_actions_action_type",
                schema: "hives",
                table: "hive_actions",
                sql: "\"action_type\" IN ('Inspection', 'VarroaTreatment', 'SyrupFeeding', 'PattyFeeding', 'HoneyFrameFeeding', 'Insulation', 'Maintenance', 'SuperManagement')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_actions_action_type",
                schema: "hives",
                table: "hive_actions");

            migrationBuilder.DropColumn(
                name: "action_type",
                schema: "hives",
                table: "hive_actions");
        }
    }
}
