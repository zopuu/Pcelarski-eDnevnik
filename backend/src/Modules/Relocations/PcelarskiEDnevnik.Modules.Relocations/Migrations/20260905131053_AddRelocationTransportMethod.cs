using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Relocations.Migrations
{
    /// <inheritdoc />
    public partial class AddRelocationTransportMethod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "transport_method",
                schema: "relocations",
                table: "relocations",
                type: "character varying(7)",
                maxLength: 7,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddCheckConstraint(
                name: "ck_relocations_transport_method",
                schema: "relocations",
                table: "relocations",
                sql: "\"transport_method\" IN ('Trailer', 'Truck', 'Van', 'Other')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_relocations_transport_method",
                schema: "relocations",
                table: "relocations");

            migrationBuilder.AlterColumn<string>(
                name: "transport_method",
                schema: "relocations",
                table: "relocations",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(7)",
                oldMaxLength: 7);
        }
    }
}
