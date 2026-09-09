using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementVarroaTreatment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "application_method",
                schema: "hives",
                table: "varroa_treatments",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "dose_amount",
                schema: "hives",
                table: "varroa_treatments",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "dose_unit",
                schema: "hives",
                table: "varroa_treatments",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "product_name",
                schema: "hives",
                table: "varroa_treatments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "ck_varroa_treatments_application_method",
                schema: "hives",
                table: "varroa_treatments",
                sql: "\"application_method\" IN (\n    'STRIPS',\n    'FUMIGATION',\n    'TRICKLING',\n    'VAPORIZATION',\n    'SPRAYING',\n    'OTHER'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_varroa_treatments_dose_amount_positive",
                schema: "hives",
                table: "varroa_treatments",
                sql: "dose_amount > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_varroa_treatments_dose_unit",
                schema: "hives",
                table: "varroa_treatments",
                sql: "\"dose_unit\" IN (\n    'ML',\n    'STRIPS',\n    'G'\n)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_varroa_treatments_application_method",
                schema: "hives",
                table: "varroa_treatments");

            migrationBuilder.DropCheckConstraint(
                name: "ck_varroa_treatments_dose_amount_positive",
                schema: "hives",
                table: "varroa_treatments");

            migrationBuilder.DropCheckConstraint(
                name: "ck_varroa_treatments_dose_unit",
                schema: "hives",
                table: "varroa_treatments");

            migrationBuilder.DropColumn(
                name: "application_method",
                schema: "hives",
                table: "varroa_treatments");

            migrationBuilder.DropColumn(
                name: "dose_amount",
                schema: "hives",
                table: "varroa_treatments");

            migrationBuilder.DropColumn(
                name: "dose_unit",
                schema: "hives",
                table: "varroa_treatments");

            migrationBuilder.DropColumn(
                name: "product_name",
                schema: "hives",
                table: "varroa_treatments");
        }
    }
}
