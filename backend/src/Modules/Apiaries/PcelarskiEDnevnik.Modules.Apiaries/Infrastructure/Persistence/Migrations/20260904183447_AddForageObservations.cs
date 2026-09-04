using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddForageObservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "forage_observations",
                schema: "apiaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    observed_by_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    observed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    forage_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    intensity = table.Column<short>(type: "smallint", nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    location_id = table.Column<Guid>(type: "uuid", nullable: false),
                    forage_profile_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_forage_observations", x => x.id);
                    table.CheckConstraint("ck_forage_observations_forage_type", "\"forage_type\" IN (\r\n    'Meadow',\r\n    'Forest',\r\n    'Sunflower',\r\n    'Acacia',\r\n    'Linden',\r\n    'OilseedRape',\r\n    'Clover',\r\n    'FruitTrees',\r\n    'Chestnut',\r\n    'Buckwheat',\r\n    'Other'\r\n)");
                    table.CheckConstraint("ck_forage_observations_intensity", "\"intensity\" BETWEEN 1 AND 5");
                    table.ForeignKey(
                        name: "fk_forage_observations_forage_profiles_forage_profile_id",
                        column: x => x.forage_profile_id,
                        principalSchema: "apiaries",
                        principalTable: "forage_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_forage_observations_locations_location_id",
                        column: x => x.location_id,
                        principalSchema: "apiaries",
                        principalTable: "locations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_forage_observations_beekeeper_observed_at",
                schema: "apiaries",
                table: "forage_observations",
                columns: new[] { "observed_by_beekeeper_id", "observed_at" });

            migrationBuilder.CreateIndex(
                name: "ix_forage_observations_location_id",
                schema: "apiaries",
                table: "forage_observations",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "ix_forage_observations_profile_observed_at",
                schema: "apiaries",
                table: "forage_observations",
                columns: new[] { "forage_profile_id", "observed_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "forage_observations",
                schema: "apiaries");
        }
    }
}
