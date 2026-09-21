using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeApiaryNameRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE apiaries.apiaries
                SET name = 'Pčelinjak'
                WHERE name IS NULL
                   OR btrim(name) = '';
                """);

            migrationBuilder.AlterColumn<string>(
                name: "name",
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
                name: "ck_apiaries_name_not_blank",
                schema: "apiaries",
                table: "apiaries",
                sql: "btrim(\"name\") <> ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_apiaries_name_not_blank",
                schema: "apiaries",
                table: "apiaries");

            migrationBuilder.AlterColumn<string>(
                name: "name",
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
