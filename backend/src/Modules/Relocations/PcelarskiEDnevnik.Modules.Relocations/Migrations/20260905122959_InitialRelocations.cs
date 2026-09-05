using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Relocations.Migrations
{
    /// <inheritdoc />
    public partial class InitialRelocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "relocations");

            migrationBuilder.CreateTable(
                name: "relocations",
                schema: "relocations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    beekeeper_id = table.Column<Guid>(type: "uuid", nullable: false),
                    occurred_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    cost_amount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    currency_code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    transport_method = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    distance_km = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: true),
                    kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_relocations", x => x.id);
                    table.CheckConstraint("ck_relocations_cost_amount", "\"cost_amount\" IS NULL OR \"cost_amount\" >= 0");
                    table.CheckConstraint("ck_relocations_cost_currency", "(\r\n    \"cost_amount\" IS NULL\r\n    AND\r\n    \"currency_code\" IS NULL\r\n)\r\nOR\r\n(\r\n    \"cost_amount\" IS NOT NULL\r\n    AND\r\n    \"currency_code\" IS NOT NULL\r\n)");
                    table.CheckConstraint("ck_relocations_currency_code", "\"currency_code\" IS NULL\r\nOR \"currency_code\" ~ '^[A-Z]{3}$'");
                    table.CheckConstraint("ck_relocations_distance_km", "\"distance_km\" IS NULL OR \"distance_km\" >= 0");
                    table.CheckConstraint("ck_relocations_kind", "\"kind\" IN ('WholeApiary', 'SelectedHives')");
                });

            migrationBuilder.CreateTable(
                name: "apiary_relocations",
                schema: "relocations",
                columns: table => new
                {
                    relocation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    origin_apiary_stay_id = table.Column<Guid>(type: "uuid", nullable: false),
                    destination_apiary_stay_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_apiary_relocations", x => x.relocation_id);
                    table.CheckConstraint("ck_apiary_relocations_different_stays", "\"origin_apiary_stay_id\" <> \"destination_apiary_stay_id\"");
                    table.ForeignKey(
                        name: "fk_apiary_relocations_relocations_relocation_id",
                        column: x => x.relocation_id,
                        principalSchema: "relocations",
                        principalTable: "relocations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hive_relocations",
                schema: "relocations",
                columns: table => new
                {
                    relocation_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hive_relocations", x => x.relocation_id);
                    table.ForeignKey(
                        name: "fk_hive_relocations_relocations_relocation_id",
                        column: x => x.relocation_id,
                        principalSchema: "relocations",
                        principalTable: "relocations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hive_relocation_items",
                schema: "relocations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    hive_relocation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    origin_hive_stay_id = table.Column<Guid>(type: "uuid", nullable: false),
                    destination_hive_stay_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hive_relocation_items", x => x.id);
                    table.CheckConstraint("ck_hive_relocation_items_different_stays", "\"origin_hive_stay_id\" <> \"destination_hive_stay_id\"");
                    table.ForeignKey(
                        name: "fk_hive_relocation_items_hive_relocations_hive_relocation_id",
                        column: x => x.hive_relocation_id,
                        principalSchema: "relocations",
                        principalTable: "hive_relocations",
                        principalColumn: "relocation_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ux_apiary_relocations_destination_apiary_stay_id",
                schema: "relocations",
                table: "apiary_relocations",
                column: "destination_apiary_stay_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_apiary_relocations_origin_apiary_stay_id",
                schema: "relocations",
                table: "apiary_relocations",
                column: "origin_apiary_stay_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_hive_relocation_items_hive_relocation_id",
                schema: "relocations",
                table: "hive_relocation_items",
                column: "hive_relocation_id");

            migrationBuilder.CreateIndex(
                name: "ux_hive_relocation_items_destination_hive_stay_id",
                schema: "relocations",
                table: "hive_relocation_items",
                column: "destination_hive_stay_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_hive_relocation_items_origin_hive_stay_id",
                schema: "relocations",
                table: "hive_relocation_items",
                column: "origin_hive_stay_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_relocations_beekeeper_id_occurred_at_utc",
                schema: "relocations",
                table: "relocations",
                columns: new[] { "beekeeper_id", "occurred_at_utc" });
            migrationBuilder.AddForeignKey(
    name:
        "fk_apiary_relocations_origin_apiary_stay_id",
    schema: "relocations",
    table: "apiary_relocations",
    column: "origin_apiary_stay_id",
    principalSchema: "apiaries",
    principalTable: "apiary_stays",
    principalColumn: "id",
    onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name:
                    "fk_apiary_relocations_destination_apiary_stay_id",
                schema: "relocations",
                table: "apiary_relocations",
                column: "destination_apiary_stay_id",
                principalSchema: "apiaries",
                principalTable: "apiary_stays",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name:
                    "fk_hive_relocation_items_origin_hive_stay_id",
                schema: "relocations",
                table: "hive_relocation_items",
                column: "origin_hive_stay_id",
                principalSchema: "hives",
                principalTable: "hive_stays",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name:
                    "fk_hive_relocation_items_destination_hive_stay_id",
                schema: "relocations",
                table: "hive_relocation_items",
                column: "destination_hive_stay_id",
                principalSchema: "hives",
                principalTable: "hive_stays",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict); 

            migrationBuilder.Sql(
    """
    CREATE OR REPLACE FUNCTION
        relocations.validate_relocation_structure(
            p_relocation_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_kind varchar(20);
        v_apiary_count integer;
        v_hive_count integer;
        v_hive_item_count integer;
    BEGIN
        SELECT r.kind
        INTO v_kind
        FROM relocations.relocations r
        WHERE r.id = p_relocation_id;

        IF NOT FOUND THEN
            RETURN;
        END IF;

        SELECT COUNT(*)
        INTO v_apiary_count
        FROM relocations.apiary_relocations
        WHERE relocation_id = p_relocation_id;

        SELECT COUNT(*)
        INTO v_hive_count
        FROM relocations.hive_relocations
        WHERE relocation_id = p_relocation_id;

        IF v_kind = 'WholeApiary' THEN
            IF v_apiary_count <> 1
               OR v_hive_count <> 0 THEN
                RAISE EXCEPTION
                    'Invalid WholeApiary relocation structure for %',
                    p_relocation_id
                    USING
                        ERRCODE = '23514',
                        CONSTRAINT =
                            'ck_relocations_structure';
            END IF;

        ELSIF v_kind = 'SelectedHives' THEN
            IF v_apiary_count <> 0
               OR v_hive_count <> 1 THEN
                RAISE EXCEPTION
                    'Invalid SelectedHives relocation structure for %',
                    p_relocation_id
                    USING
                        ERRCODE = '23514',
                        CONSTRAINT =
                            'ck_relocations_structure';
            END IF;

            SELECT COUNT(*)
            INTO v_hive_item_count
            FROM relocations.hive_relocation_items
            WHERE hive_relocation_id =
                p_relocation_id;

            IF v_hive_item_count < 1 THEN
                RAISE EXCEPTION
                    'SelectedHives relocation % must contain at least one hive item',
                    p_relocation_id
                    USING
                        ERRCODE = '23514',
                        CONSTRAINT =
                            'ck_relocations_structure';
            END IF;
        END IF;
    END;
    $$;
    """);
            migrationBuilder.Sql(
    """
    CREATE OR REPLACE FUNCTION
        relocations.check_relocation_structure()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_old_relocation_id uuid;
        v_new_relocation_id uuid;
    BEGIN
        IF TG_TABLE_NAME = 'relocations' THEN

            IF TG_OP <> 'INSERT' THEN
                v_old_relocation_id :=
                    OLD.id;
            END IF;

            IF TG_OP <> 'DELETE' THEN
                v_new_relocation_id :=
                    NEW.id;
            END IF;

        ELSIF TG_TABLE_NAME =
            'hive_relocation_items' THEN

            IF TG_OP <> 'INSERT' THEN
                v_old_relocation_id :=
                    OLD.hive_relocation_id;
            END IF;

            IF TG_OP <> 'DELETE' THEN
                v_new_relocation_id :=
                    NEW.hive_relocation_id;
            END IF;

        ELSE

            IF TG_OP <> 'INSERT' THEN
                v_old_relocation_id :=
                    OLD.relocation_id;
            END IF;

            IF TG_OP <> 'DELETE' THEN
                v_new_relocation_id :=
                    NEW.relocation_id;
            END IF;

        END IF;

        IF v_old_relocation_id IS NOT NULL THEN
            PERFORM
                relocations
                    .validate_relocation_structure(
                        v_old_relocation_id);
        END IF;

        IF v_new_relocation_id IS NOT NULL
           AND v_new_relocation_id
               IS DISTINCT FROM
               v_old_relocation_id THEN
            PERFORM
                relocations
                    .validate_relocation_structure(
                        v_new_relocation_id);
        END IF;

        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;

        RETURN NEW;
    END;
    $$;
    """);
            migrationBuilder.Sql(
    """
    CREATE CONSTRAINT TRIGGER
        ct_relocations_structure
    AFTER INSERT OR UPDATE
    ON relocations.relocations
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION
        relocations.check_relocation_structure();

    CREATE CONSTRAINT TRIGGER
        ct_apiary_relocations_structure
    AFTER INSERT OR UPDATE OR DELETE
    ON relocations.apiary_relocations
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION
        relocations.check_relocation_structure();

    CREATE CONSTRAINT TRIGGER
        ct_hive_relocations_structure
    AFTER INSERT OR UPDATE OR DELETE
    ON relocations.hive_relocations
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION
        relocations.check_relocation_structure();

    CREATE CONSTRAINT TRIGGER
        ct_hive_relocation_items_structure
    AFTER INSERT OR UPDATE OR DELETE
    ON relocations.hive_relocation_items
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION
        relocations.check_relocation_structure();
    """); 
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
    """
    DROP TRIGGER IF EXISTS
        ct_hive_relocation_items_structure
    ON relocations.hive_relocation_items;

    DROP TRIGGER IF EXISTS
        ct_hive_relocations_structure
    ON relocations.hive_relocations;

    DROP TRIGGER IF EXISTS
        ct_apiary_relocations_structure
    ON relocations.apiary_relocations;

    DROP TRIGGER IF EXISTS
        ct_relocations_structure
    ON relocations.relocations;

    DROP FUNCTION IF EXISTS
        relocations.check_relocation_structure();

    DROP FUNCTION IF EXISTS
        relocations.validate_relocation_structure(uuid);
    """);
            migrationBuilder.DropTable(
                name: "apiary_relocations",
                schema: "relocations");

            migrationBuilder.DropTable(
                name: "hive_relocation_items",
                schema: "relocations");

            migrationBuilder.DropTable(
                name: "hive_relocations",
                schema: "relocations");

            migrationBuilder.DropTable(
                name: "relocations",
                schema: "relocations");
        }
    }
}
