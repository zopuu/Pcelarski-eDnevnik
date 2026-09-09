using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHiveSuperManagementStorage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hive_supers",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    frame_count = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    color_hex = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hive_supers", x => x.id);
                    table.CheckConstraint("ck_hive_supers_color_hex", "\"color_hex\" IS NULL\r\nOR \"color_hex\" ~ '^#[0-9A-Fa-f]{6}$'");
                    table.CheckConstraint("ck_hive_supers_frame_count", "\"frame_count\" >= 1");
                    table.CheckConstraint("ck_hive_supers_status", "\"status\" IN (\r\n    'OnHive',\r\n    'ReadyForHarvest',\r\n    'Archived'\r\n)");
                    table.CheckConstraint("ck_hive_supers_type", "\"type\" IN (\r\n    'DadantBlatt',\r\n    'LangstrothRoot',\r\n    'AlbertiZnidersic',\r\n    'Farrar',\r\n    'Nucleus',\r\n    'Other'\r\n)");
                });

            migrationBuilder.CreateTable(
                name: "hive_super_stays",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_super_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_on = table.Column<DateOnly>(type: "date", nullable: false),
                    ended_on = table.Column<DateOnly>(type: "date", nullable: true),
                    harvestable_frame_count = table.Column<int>(type: "integer", nullable: true),
                    remaining_harvestable_frame_count = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hive_super_stays", x => x.id);
                    table.CheckConstraint("ck_hive_super_stays_dates", "\"ended_on\" IS NULL\r\nOR \"ended_on\" >= \"started_on\"");
                    table.CheckConstraint("ck_hive_super_stays_frame_counts_pair", "(\r\n    \"harvestable_frame_count\" IS NULL\r\n    AND\r\n    \"remaining_harvestable_frame_count\" IS NULL\r\n)\r\nOR\r\n(\r\n    \"harvestable_frame_count\" IS NOT NULL\r\n    AND\r\n    \"remaining_harvestable_frame_count\" IS NOT NULL\r\n)");
                    table.CheckConstraint("ck_hive_super_stays_harvest_requires_end", "\"harvestable_frame_count\" IS NULL\r\nOR \"ended_on\" IS NOT NULL");
                    table.CheckConstraint("ck_hive_super_stays_harvestable_frame_count", "\"harvestable_frame_count\" IS NULL\r\nOR \"harvestable_frame_count\" >= 1");
                    table.CheckConstraint("ck_hive_super_stays_remaining_frame_count", "\"remaining_harvestable_frame_count\" IS NULL\r\nOR \"remaining_harvestable_frame_count\" >= 0");
                    table.CheckConstraint("ck_hive_super_stays_remaining_not_greater_than_total", "\"remaining_harvestable_frame_count\" IS NULL\r\nOR\r\n\"remaining_harvestable_frame_count\"\r\n    <= \"harvestable_frame_count\"");
                    table.ForeignKey(
                        name: "fk_hive_super_stays_hive",
                        column: x => x.hive_id,
                        principalSchema: "hives",
                        principalTable: "hives",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_hive_super_stays_super",
                        column: x => x.hive_super_id,
                        principalSchema: "hives",
                        principalTable: "hive_supers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "super_management_items",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    super_management_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_super_id = table.Column<Guid>(type: "uuid", nullable: false),
                    operation = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_super_management_items", x => x.id);
                    table.CheckConstraint("ck_super_management_items_operation", "\"operation\" IN (\r\n    'AddToHive',\r\n    'RemoveForHarvest',\r\n    'RemoveAndArchive'\r\n)");
                    table.ForeignKey(
                        name: "fk_super_management_items_management",
                        column: x => x.super_management_id,
                        principalSchema: "hives",
                        principalTable: "super_management",
                        principalColumn: "action_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_super_management_items_super",
                        column: x => x.hive_super_id,
                        principalSchema: "hives",
                        principalTable: "hive_supers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_hive_super_stays_active_hive",
                schema: "hives",
                table: "hive_super_stays",
                column: "hive_id",
                filter: "\"ended_on\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_hive_super_stays_hive_started_on",
                schema: "hives",
                table: "hive_super_stays",
                columns: new[] { "hive_id", "started_on" });

            migrationBuilder.CreateIndex(
                name: "ix_hive_super_stays_super_started_on",
                schema: "hives",
                table: "hive_super_stays",
                columns: new[] { "hive_super_id", "started_on" });

            migrationBuilder.CreateIndex(
                name: "ux_hive_super_stays_active_super",
                schema: "hives",
                table: "hive_super_stays",
                column: "hive_super_id",
                unique: true,
                filter: "\"ended_on\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_hive_supers_owner_beekeeper_id_status",
                schema: "hives",
                table: "hive_supers",
                columns: new[] { "owner_beekeeper_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_super_management_items_hive_super_id",
                schema: "hives",
                table: "super_management_items",
                column: "hive_super_id");

            migrationBuilder.CreateIndex(
                name: "ux_super_management_items_management_super",
                schema: "hives",
                table: "super_management_items",
                columns: new[] { "super_management_id", "hive_super_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hive_super_stays",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "super_management_items",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "hive_supers",
                schema: "hives");
        }
    }
}
