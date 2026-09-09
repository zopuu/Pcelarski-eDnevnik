using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementHoneyFrameFeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "frame_count",
                schema: "hives",
                table: "honey_frame_feedings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "frame_source",
                schema: "hives",
                table: "honey_frame_feedings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_honey_frame_feedings_frame_count_maximum",
                schema: "hives",
                table: "honey_frame_feedings",
                sql: "frame_count <= 20");

            migrationBuilder.AddCheckConstraint(
                name: "ck_honey_frame_feedings_frame_count_positive",
                schema: "hives",
                table: "honey_frame_feedings",
                sql: "frame_count > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_honey_frame_feedings_frame_count_maximum",
                schema: "hives",
                table: "honey_frame_feedings");

            migrationBuilder.DropCheckConstraint(
                name: "ck_honey_frame_feedings_frame_count_positive",
                schema: "hives",
                table: "honey_frame_feedings");

            migrationBuilder.DropColumn(
                name: "frame_count",
                schema: "hives",
                table: "honey_frame_feedings");

            migrationBuilder.DropColumn(
                name: "frame_source",
                schema: "hives",
                table: "honey_frame_feedings");
        }
    }
}
