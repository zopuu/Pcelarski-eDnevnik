using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddApiaryLayouts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "apiary_layouts",
                schema: "apiaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    apiary_stay_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version = table.Column<long>(type: "bigint", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_apiary_layouts", x => x.id);
                    table.CheckConstraint("ck_apiary_layouts_version", "\"version\" >= 1");
                    table.ForeignKey(
                        name: "fk_apiary_layouts_apiary_stays_apiary_stay_id",
                        column: x => x.apiary_stay_id,
                        principalSchema: "apiaries",
                        principalTable: "apiary_stays",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "apiary_layout_positions",
                schema: "apiaries",
                columns: table => new
                {
                    layout_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_id = table.Column<Guid>(type: "uuid", nullable: false),
                    x = table.Column<int>(type: "integer", nullable: false),
                    y = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_apiary_layout_positions", x => new { x.layout_id, x.hive_id });
                    table.CheckConstraint("ck_apiary_layout_positions_x", "\"x\" >= 0");
                    table.CheckConstraint("ck_apiary_layout_positions_y", "\"y\" >= 0");
                    table.ForeignKey(
                        name: "fk_apiary_layout_positions_apiary_layouts_layout_id",
                        column: x => x.layout_id,
                        principalSchema: "apiaries",
                        principalTable: "apiary_layouts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ux_apiary_layouts_apiary_stay_id",
                schema: "apiaries",
                table: "apiary_layouts",
                column: "apiary_stay_id",
                unique: true);

            migrationBuilder.Sql("""
                INSERT INTO apiaries.apiary_layouts (
                    id,
                    apiary_stay_id,
                    version,
                    created_at_utc,
                    updated_at_utc)
                SELECT
                    gen_random_uuid(),
                    stay.id,
                    1,
                    statement_timestamp(),
                    statement_timestamp()
                FROM apiaries.apiary_stays AS stay
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM apiaries.apiary_layouts AS layout
                    WHERE layout.apiary_stay_id = stay.id);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "apiary_layout_positions",
                schema: "apiaries");

            migrationBuilder.DropTable(
                name: "apiary_layouts",
                schema: "apiaries");
        }
    }
}
