using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialHives : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "hives");

            migrationBuilder.CreateTable(
                name: "hives",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    identification_number = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    label = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    color_hex = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    manufacture_date = table.Column<DateOnly>(type: "date", nullable: true),
                    manufacturer = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    material = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    purchase_date = table.Column<DateOnly>(type: "date", nullable: true),
                    has_feeder = table.Column<bool>(type: "boolean", nullable: false),
                    feeder_volume_ml = table.Column<int>(type: "integer", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hives", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "hive_stays",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_id = table.Column<Guid>(type: "uuid", nullable: false),
                    apiary_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ended_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hive_stays", x => x.id);
                    table.CheckConstraint("ck_hive_stays_date_range", "ended_at_utc IS NULL OR ended_at_utc >= started_at_utc");
                    table.ForeignKey(
                        name: "FK_hive_stays_hives_hive_id",
                        column: x => x.hive_id,
                        principalSchema: "hives",
                        principalTable: "hives",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_hive_stays_apiary_id",
                schema: "hives",
                table: "hive_stays",
                column: "apiary_id");

            migrationBuilder.CreateIndex(
                name: "ux_hive_stays_active_hive",
                schema: "hives",
                table: "hive_stays",
                column: "hive_id",
                unique: true,
                filter: "ended_at_utc IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_hives_owner_beekeeper_id",
                schema: "hives",
                table: "hives",
                column: "owner_beekeeper_id");

            migrationBuilder.CreateIndex(
                name: "ux_hives_identification_number",
                schema: "hives",
                table: "hives",
                column: "identification_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hive_stays",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "hives",
                schema: "hives");
        }
    }
}
