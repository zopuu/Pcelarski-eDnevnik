using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeApiaryTypeRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE apiaries.apiaries
                SET type = 'Stationary'
                WHERE type IS NULL
                   OR type NOT IN ('Stationary', 'Migratory');
                """);

            migrationBuilder.AlterColumn<string>(
                name: "type",
                schema: "apiaries",
                table: "apiaries",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_apiaries_type",
                schema: "apiaries",
                table: "apiaries",
                sql: "\"type\" IN ('Stationary', 'Migratory')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_apiaries_type",
                schema: "apiaries",
                table: "apiaries");

            migrationBuilder.AlterColumn<string>(
                name: "type",
                schema: "apiaries",
                table: "apiaries",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);
        }
    }
}
