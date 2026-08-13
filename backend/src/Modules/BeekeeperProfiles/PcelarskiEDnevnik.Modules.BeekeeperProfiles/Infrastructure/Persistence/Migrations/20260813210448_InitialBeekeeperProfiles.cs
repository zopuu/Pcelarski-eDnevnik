using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.BeekeeperProfiles.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialBeekeeperProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "profiles");

            migrationBuilder.CreateTable(
                name: "beekeeper_profiles",
                schema: "profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    last_name = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    hid = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    agricultural_holding_number = table.Column<int>(type: "integer", nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beekeeper_profiles", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ux_beekeeper_profiles_agricultural_holding_number",
                schema: "profiles",
                table: "beekeeper_profiles",
                column: "agricultural_holding_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_beekeeper_profiles_hid",
                schema: "profiles",
                table: "beekeeper_profiles",
                column: "hid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_beekeeper_profiles_user_id",
                schema: "profiles",
                table: "beekeeper_profiles",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "beekeeper_profiles",
                schema: "profiles");
        }
    }
}
