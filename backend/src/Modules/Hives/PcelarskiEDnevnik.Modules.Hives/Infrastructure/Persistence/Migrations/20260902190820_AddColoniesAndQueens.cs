using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddColoniesAndQueens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "colonies",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    origin = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    formed_on = table.Column<DateOnly>(type: "date", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_colonies", x => x.id);
                    table.CheckConstraint("ck_colonies_origin", "\"origin\" IS NULL\r\nOR \"origin\" IN (\r\n    'Swarm',\r\n    'Purchased',\r\n    'Split'\r\n)");
                    table.CheckConstraint("ck_colonies_status", "\"status\" IN (\r\n    'Active',\r\n    'Dead',\r\n    'Split',\r\n    'Merged',\r\n    'Sold',\r\n    'Lost'\r\n)");
                });

            migrationBuilder.CreateTable(
                name: "queens",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    marking_color_hex = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    origin = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    breeder = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    breed = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    emerged_on = table.Column<DateOnly>(type: "date", nullable: true),
                    acquired_on = table.Column<DateOnly>(type: "date", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_queens", x => x.id);
                    table.CheckConstraint("ck_queens_origin", "\"origin\" IS NULL\r\nOR \"origin\" IN (\r\n    'Purchased',\r\n    'Produced'\r\n)");
                    table.CheckConstraint("ck_queens_status", "\"status\" IN (\r\n    'Active',\r\n    'Dead',\r\n    'Killed',\r\n    'Missing'\r\n)");
                });

            migrationBuilder.CreateTable(
                name: "colony_stays",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    colony_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_on = table.Column<DateOnly>(type: "date", nullable: false),
                    ended_on = table.Column<DateOnly>(type: "date", nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_colony_stays", x => x.id);
                    table.CheckConstraint("ck_colony_stays_dates", "\"ended_on\" IS NULL\r\nOR \"ended_on\" >= \"started_on\"");
                    table.ForeignKey(
                        name: "FK_colony_stays_colonies_colony_id",
                        column: x => x.colony_id,
                        principalSchema: "hives",
                        principalTable: "colonies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_colony_stays_hives_hive_id",
                        column: x => x.hive_id,
                        principalSchema: "hives",
                        principalTable: "hives",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "queen_stays",
                schema: "hives",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    queen_id = table.Column<Guid>(type: "uuid", nullable: false),
                    colony_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_on = table.Column<DateOnly>(type: "date", nullable: false),
                    ended_on = table.Column<DateOnly>(type: "date", nullable: true),
                    introduction_method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    introduction_outcome = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    end_reason = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_queen_stays", x => x.id);
                    table.CheckConstraint("ck_queen_stays_dates", "\"ended_on\" IS NULL\r\nOR \"ended_on\" >= \"started_on\"");
                    table.CheckConstraint("ck_queen_stays_end_reason", "\"end_reason\" IS NULL\r\nOR \"end_reason\" IN (\r\n    'Replaced',\r\n    'Dead',\r\n    'Killed',\r\n    'Missing',\r\n    'Removed',\r\n    'Swarmed',\r\n    'ColonyEnded',\r\n    'Other'\r\n)");
                    table.CheckConstraint("ck_queen_stays_introduction_method", "\"introduction_method\" IS NULL\r\nOR \"introduction_method\" IN (\r\n    'Placement',\r\n    'Caged',\r\n    'Direct',\r\n    'Unknown',\r\n    'Other'\r\n)");
                    table.CheckConstraint("ck_queen_stays_introduction_outcome", "\"introduction_outcome\" IS NULL\r\nOR \"introduction_outcome\" IN (\r\n    'Accepted',\r\n    'Killed',\r\n    'Missing',\r\n    'Unverified',\r\n    'Other'\r\n)");
                    table.ForeignKey(
                        name: "FK_queen_stays_colonies_colony_id",
                        column: x => x.colony_id,
                        principalSchema: "hives",
                        principalTable: "colonies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_queen_stays_queens_queen_id",
                        column: x => x.queen_id,
                        principalSchema: "hives",
                        principalTable: "queens",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_colonies_owner_beekeeper_id",
                schema: "hives",
                table: "colonies",
                column: "owner_beekeeper_id");

            migrationBuilder.CreateIndex(
                name: "ix_colony_stays_colony_started_on",
                schema: "hives",
                table: "colony_stays",
                columns: new[] { "colony_id", "started_on" });

            migrationBuilder.CreateIndex(
                name: "ix_colony_stays_hive_started_on",
                schema: "hives",
                table: "colony_stays",
                columns: new[] { "hive_id", "started_on" });

            migrationBuilder.CreateIndex(
                name: "ux_colony_stays_active_colony",
                schema: "hives",
                table: "colony_stays",
                column: "colony_id",
                unique: true,
                filter: "\"ended_on\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "ux_colony_stays_active_hive",
                schema: "hives",
                table: "colony_stays",
                column: "hive_id",
                unique: true,
                filter: "\"ended_on\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_queen_stays_colony_started_on",
                schema: "hives",
                table: "queen_stays",
                columns: new[] { "colony_id", "started_on" });

            migrationBuilder.CreateIndex(
                name: "ix_queen_stays_queen_started_on",
                schema: "hives",
                table: "queen_stays",
                columns: new[] { "queen_id", "started_on" });

            migrationBuilder.CreateIndex(
                name: "ux_queen_stays_active_colony",
                schema: "hives",
                table: "queen_stays",
                column: "colony_id",
                unique: true,
                filter: "\"ended_on\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "ux_queen_stays_active_queen",
                schema: "hives",
                table: "queen_stays",
                column: "queen_id",
                unique: true,
                filter: "\"ended_on\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_queens_owner_beekeeper_id",
                schema: "hives",
                table: "queens",
                column: "owner_beekeeper_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "colony_stays",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "queen_stays",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "colonies",
                schema: "hives");

            migrationBuilder.DropTable(
                name: "queens",
                schema: "hives");
        }
    }
}
