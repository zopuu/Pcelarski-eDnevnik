using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialApiaries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "apiaries");

            migrationBuilder.CreateTable(
                name: "apiaries",
                schema: "apiaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    identification_number = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: true),
                    name = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_apiaries", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_apiaries_owner_beekeeper_id",
                schema: "apiaries",
                table: "apiaries",
                column: "owner_beekeeper_id");

            migrationBuilder.CreateIndex(
                name: "ux_apiaries_identification_number",
                schema: "apiaries",
                table: "apiaries",
                column: "identification_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "apiaries",
                schema: "apiaries");
        }
    }
}
