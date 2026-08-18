using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationsAndApiaryStays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "locations",
                schema: "apiaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    latitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: false),
                    longitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: false),
                    altitude_m = table.Column<int>(type: "integer", nullable: true),
                    cadastral_parcel_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_locations", x => x.id);
                    table.CheckConstraint("ck_locations_latitude", "\"latitude\" >= -90 AND \"latitude\" <= 90");
                    table.CheckConstraint("ck_locations_longitude", "\"longitude\" >= -180 AND \"longitude\" <= 180");
                });

            migrationBuilder.CreateTable(
                name: "apiary_stays",
                schema: "apiaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    apiary_id = table.Column<Guid>(type: "uuid", nullable: false),
                    location_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ended_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    orientation = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_apiary_stays", x => x.id);
                    table.CheckConstraint("ck_apiary_stays_dates", "\"ended_at_utc\" IS NULL OR \"ended_at_utc\" > \"started_at_utc\"");
                    table.ForeignKey(
                        name: "fk_apiary_stays_apiaries_apiary_id",
                        column: x => x.apiary_id,
                        principalSchema: "apiaries",
                        principalTable: "apiaries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_apiary_stays_locations_location_id",
                        column: x => x.location_id,
                        principalSchema: "apiaries",
                        principalTable: "locations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_apiary_stays_location_id",
                schema: "apiaries",
                table: "apiary_stays",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "ux_apiary_stays_one_active_per_apiary",
                schema: "apiaries",
                table: "apiary_stays",
                column: "apiary_id",
                unique: true,
                filter: "\"ended_at_utc\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_locations_owner_beekeeper_id",
                schema: "apiaries",
                table: "locations",
                column: "owner_beekeeper_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "apiary_stays",
                schema: "apiaries");

            migrationBuilder.DropTable(
                name: "locations",
                schema: "apiaries");
        }
    }
}
