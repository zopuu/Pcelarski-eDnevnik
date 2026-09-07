using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHiveActionsHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hive_actions",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_id = table.Column<Guid>(type: "uuid", nullable: false),
                    performed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    performed_by_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action_group_id = table.Column<Guid>(type: "uuid", nullable: true),
                    image_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hive_actions", x => x.id);
                    table.ForeignKey(
                        name: "FK_hive_actions_hives_hive_id",
                        column: x => x.hive_id,
                        principalSchema: "hives",
                        principalTable: "hives",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "hive_inspections",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hive_inspections", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_hive_inspections_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hive_insulation",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hive_insulation", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_hive_insulation_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hive_maintenance",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hive_maintenance", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_hive_maintenance_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "honey_frame_feedings",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_honey_frame_feedings", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_honey_frame_feedings_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "patty_feedings",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patty_feedings", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_patty_feedings_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "super_management",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_super_management", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_super_management_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "syrup_feedings",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_syrup_feedings", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_syrup_feedings_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "varroa_treatments",
                schema: "hives",
                columns: table => new
                {
                    action_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_varroa_treatments", x => x.action_id);
                    table.ForeignKey(
                        name: "FK_varroa_treatments_hive_actions_action_id",
                        column: x => x.action_id,
                        principalSchema: "hives",
                        principalTable: "hive_actions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_hive_actions_action_group_id",
                schema: "hives",
                table: "hive_actions",
                column: "action_group_id",
                filter: "\"action_group_id\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_hive_actions_hive_id_performed_at",
                schema: "hives",
                table: "hive_actions",
                columns: new[] { "hive_id", "performed_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hive_inspections",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "hive_insulation",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "hive_maintenance",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "honey_frame_feedings",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "patty_feedings",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "super_management",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "syrup_feedings",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "varroa_treatments",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "hive_actions",
                schema: "hives");
        }
    }
}
