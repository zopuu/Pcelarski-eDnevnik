using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Harvests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialHarvests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "harvests");

            migrationBuilder.CreateTable(
                name: "honey_batches",
                schema: "harvests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    batch_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(12,3)", precision: 12, scale: 3, nullable: false),
                    unit = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    period_started_on = table.Column<DateOnly>(type: "date", nullable: false),
                    period_ended_on = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_honey_batches", x => x.id);
                    table.CheckConstraint("ck_honey_batches_period", "period_ended_on >= period_started_on");
                    table.CheckConstraint("ck_honey_batches_total_amount", "total_amount > 0");
                });

            migrationBuilder.CreateTable(
                name: "honey_batch_compositions",
                schema: "harvests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    honey_batch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    algorithm_version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    determined_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    determination_method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_honey_batch_compositions", x => x.id);
                    table.ForeignKey(
                        name: "fk_honey_batch_compositions_honey_batches",
                        column: x => x.honey_batch_id,
                        principalSchema: "harvests",
                        principalTable: "honey_batches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "honey_harvests",
                schema: "harvests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    honey_batch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    harvested_on = table.Column<DateOnly>(type: "date", nullable: false),
                    honey_amount = table.Column<decimal>(type: "numeric(12,3)", precision: 12, scale: 3, nullable: false),
                    unit = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_honey_harvests", x => x.id);
                    table.CheckConstraint("ck_honey_harvests_honey_amount", "honey_amount > 0");
                    table.ForeignKey(
                        name: "fk_honey_harvests_honey_batches",
                        column: x => x.honey_batch_id,
                        principalSchema: "harvests",
                        principalTable: "honey_batches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "honey_batch_composition_items",
                schema: "harvests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    honey_batch_composition_id = table.Column<Guid>(type: "uuid", nullable: false),
                    forage_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    percentage = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_honey_batch_composition_items", x => x.id);
                    table.CheckConstraint("ck_honey_batch_composition_items_percentage", "percentage >= 0 AND percentage <= 100");
                    table.ForeignKey(
                        name: "fk_honey_batch_composition_items_compositions",
                        column: x => x.honey_batch_composition_id,
                        principalSchema: "harvests",
                        principalTable: "honey_batch_compositions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "honey_harvest_items",
                schema: "harvests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    honey_harvest_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_super_stay_id = table.Column<Guid>(type: "uuid", nullable: false),
                    frames_harvested = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_honey_harvest_items", x => x.id);
                    table.CheckConstraint("ck_honey_harvest_items_frames_harvested", "frames_harvested > 0");
                    table.ForeignKey(
                        name: "fk_honey_harvest_items_hive_super_stays",
                        column: x => x.hive_super_stay_id,
                        principalSchema: "hives",
                        principalTable: "hive_super_stays",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_honey_harvest_items_honey_harvests",
                        column: x => x.honey_harvest_id,
                        principalSchema: "harvests",
                        principalTable: "honey_harvests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ux_honey_batch_composition_items_composition_forage",
                schema: "harvests",
                table: "honey_batch_composition_items",
                columns: new[] { "honey_batch_composition_id", "forage_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_honey_batch_compositions_batch_determined_at",
                schema: "harvests",
                table: "honey_batch_compositions",
                columns: new[] { "honey_batch_id", "determined_at" });

            migrationBuilder.CreateIndex(
                name: "ix_honey_batches_owner_period",
                schema: "harvests",
                table: "honey_batches",
                columns: new[] { "owner_beekeeper_id", "period_started_on", "period_ended_on" });

            migrationBuilder.CreateIndex(
                name: "ix_honey_batches_owner_status",
                schema: "harvests",
                table: "honey_batches",
                columns: new[] { "owner_beekeeper_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ux_honey_batches_owner_batch_code",
                schema: "harvests",
                table: "honey_batches",
                columns: new[] { "owner_beekeeper_id", "batch_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_honey_harvest_items_hive_super_stay_id",
                schema: "harvests",
                table: "honey_harvest_items",
                column: "hive_super_stay_id");

            migrationBuilder.CreateIndex(
                name: "ux_honey_harvest_items_harvest_super_stay",
                schema: "harvests",
                table: "honey_harvest_items",
                columns: new[] { "honey_harvest_id", "hive_super_stay_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_honey_harvests_beekeeper_harvested_on",
                schema: "harvests",
                table: "honey_harvests",
                columns: new[] { "beekeeper_id", "harvested_on" });

            migrationBuilder.CreateIndex(
                name: "ix_honey_harvests_honey_batch_id",
                schema: "harvests",
                table: "honey_harvests",
                column: "honey_batch_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "honey_batch_composition_items",
                schema: "harvests");

            migrationBuilder.DropTable(
                name: "honey_harvest_items",
                schema: "harvests");

            migrationBuilder.DropTable(
                name: "honey_batch_compositions",
                schema: "harvests");

            migrationBuilder.DropTable(
                name: "honey_harvests",
                schema: "harvests");

            migrationBuilder.DropTable(
                name: "honey_batches",
                schema: "harvests");
        }
    }
}
