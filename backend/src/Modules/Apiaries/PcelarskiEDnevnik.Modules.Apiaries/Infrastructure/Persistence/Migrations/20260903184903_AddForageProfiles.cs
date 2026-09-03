using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Apiaries.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddForageProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "forage_profiles",
                schema: "apiaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    radius_km = table.Column<short>(type: "smallint", nullable: true),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    is_locked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    apiary_stay_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_forage_profiles", x => x.id);
                    table.CheckConstraint("ck_forage_profiles_radius_km", "\"radius_km\" IS NULL OR \"radius_km\" BETWEEN 1 AND 4");
                    table.ForeignKey(
                        name: "fk_forage_profiles_apiary_stays_apiary_stay_id",
                        column: x => x.apiary_stay_id,
                        principalSchema: "apiaries",
                        principalTable: "apiary_stays",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "forage_profile_items",
                schema: "apiaries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    forage_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    percentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    intensity = table.Column<short>(type: "smallint", nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    forage_profile_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_forage_profile_items", x => x.id);
                    table.CheckConstraint("ck_forage_profile_items_forage_type", "\"forage_type\" IN ('Meadow', 'Forest', 'Sunflower', 'Acacia', 'Linden', 'OilseedRape', 'Clover', 'FruitTrees', 'Chestnut', 'Buckwheat', 'Other')");
                    table.CheckConstraint("ck_forage_profile_items_intensity", "\"intensity\" BETWEEN 1 AND 5");
                    table.CheckConstraint("ck_forage_profile_items_percentage", "\"percentage\" > 0 AND \"percentage\" <= 100");
                    table.ForeignKey(
                        name: "fk_forage_profile_items_forage_profiles_forage_profile_id",
                        column: x => x.forage_profile_id,
                        principalSchema: "apiaries",
                        principalTable: "forage_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ux_forage_profile_items_profile_id_forage_type",
                schema: "apiaries",
                table: "forage_profile_items",
                columns: new[] { "forage_profile_id", "forage_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_forage_profiles_apiary_stay_id_year",
                schema: "apiaries",
                table: "forage_profiles",
                columns: new[] { "apiary_stay_id", "year" },
                unique: true);

            migrationBuilder.Sql(
                """
                CREATE FUNCTION apiaries.validate_forage_profile_item_total(
                    target_forage_profile_id uuid)
                RETURNS void
                LANGUAGE plpgsql
                AS $$
                DECLARE
                    total_percentage numeric;
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM apiaries.forage_profiles
                        WHERE id = target_forage_profile_id
                    ) THEN
                        RETURN;
                    END IF;

                    SELECT COALESCE(SUM(percentage), 0.00)
                    INTO total_percentage
                    FROM apiaries.forage_profile_items
                    WHERE forage_profile_id = target_forage_profile_id;

                    IF total_percentage <> 100.00 THEN
                        RAISE EXCEPTION
                            'Forage profile items must total exactly 100.00.'
                            USING ERRCODE = '23514',
                                CONSTRAINT = 'ck_forage_profile_items_total_percentage';
                    END IF;
                END;
                $$;

                CREATE FUNCTION apiaries.enforce_forage_profile_item_total()
                RETURNS trigger
                LANGUAGE plpgsql
                AS $$
                BEGIN
                    IF TG_OP = 'INSERT' THEN
                        PERFORM apiaries.validate_forage_profile_item_total(
                            NEW.forage_profile_id);
                    ELSIF TG_OP = 'DELETE' THEN
                        PERFORM apiaries.validate_forage_profile_item_total(
                            OLD.forage_profile_id);
                    ELSE
                        PERFORM apiaries.validate_forage_profile_item_total(
                            OLD.forage_profile_id);

                        IF NEW.forage_profile_id <> OLD.forage_profile_id THEN
                            PERFORM apiaries.validate_forage_profile_item_total(
                                NEW.forage_profile_id);
                        END IF;
                    END IF;

                    RETURN NULL;
                END;
                $$;

                CREATE FUNCTION apiaries.enforce_forage_profile_total()
                RETURNS trigger
                LANGUAGE plpgsql
                AS $$
                BEGIN
                    PERFORM apiaries.validate_forage_profile_item_total(
                        NEW.id);

                    RETURN NULL;
                END;
                $$;

                CREATE CONSTRAINT TRIGGER ck_forage_profiles_items_total_percentage
                AFTER INSERT OR UPDATE
                ON apiaries.forage_profiles
                DEFERRABLE INITIALLY DEFERRED
                FOR EACH ROW
                EXECUTE FUNCTION apiaries.enforce_forage_profile_total();

                CREATE CONSTRAINT TRIGGER ck_forage_profile_items_total_percentage
                AFTER INSERT OR UPDATE OR DELETE
                ON apiaries.forage_profile_items
                DEFERRABLE INITIALLY DEFERRED
                FOR EACH ROW
                EXECUTE FUNCTION apiaries.enforce_forage_profile_item_total();
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP TRIGGER IF EXISTS ck_forage_profile_items_total_percentage
                    ON apiaries.forage_profile_items;

                DROP TRIGGER IF EXISTS ck_forage_profiles_items_total_percentage
                    ON apiaries.forage_profiles;

                DROP FUNCTION IF EXISTS apiaries.enforce_forage_profile_item_total();
                DROP FUNCTION IF EXISTS apiaries.enforce_forage_profile_total();
                DROP FUNCTION IF EXISTS apiaries.validate_forage_profile_item_total(uuid);
                """);

            migrationBuilder.DropTable(
                name: "forage_profile_items",
                schema: "apiaries");

            migrationBuilder.DropTable(
                name: "forage_profiles",
                schema: "apiaries");
        }
    }
}
