using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddForageObservationImagePath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "image_path",
                schema: "apiaries",
                table: "forage_observations",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_path",
                schema: "apiaries",
                table: "forage_observations");
        }
    }
}
