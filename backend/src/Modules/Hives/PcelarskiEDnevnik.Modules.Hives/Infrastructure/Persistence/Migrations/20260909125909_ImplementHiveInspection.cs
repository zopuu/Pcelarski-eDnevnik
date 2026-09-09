using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ImplementHiveInspection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<short>(
                name: "bee_covered_frame_count",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "brood_coverage_percentage",
                schema: "hives",
                table: "hive_inspections",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "brood_frame_count",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "brood_pattern",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "brood_quality",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "brood_stage",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "capped_brood_frame_count",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "colony_strength",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "dead_bee_level",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "disease",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "disease_other",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "drone_brood_extent",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "drone_brood_present",
                schema: "hives",
                table: "hive_inspections",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "drone_worker_balance",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "excess_moisture_present",
                schema: "hives",
                table: "hive_inspections",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "food_store_assessment",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "has_swarmed",
                schema: "hives",
                table: "hive_inspections",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "honey_frame_count",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "honey_stores_rating",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "inspection_type",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "larvae_presence",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "mold_present",
                schema: "hives",
                table: "hive_inspections",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "odor",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "open_brood_frame_count",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "overall_condition_rating",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pest",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pest_other",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "pollen_frame_count",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "pollen_store_assessment",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "pollen_stores_rating",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "population_rating",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "predator",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "predator_other",
                schema: "hives",
                table: "hive_inspections",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "queen_cell_count",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "queen_cell_stage",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "queen_marked",
                schema: "hives",
                table: "hive_inspections",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "queen_seen",
                schema: "hives",
                table: "hive_inspections",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "starvation_risk",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "swarming_tendency",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "temperament_rating",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "varroa_level",
                schema: "hives",
                table: "hive_inspections",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_bee_covered_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"bee_covered_frame_count\" IS NULL OR \"bee_covered_frame_count\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_brood_coverage_percentage_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"brood_coverage_percentage\" IS NULL OR \"brood_coverage_percentage\" BETWEEN 0 AND 100");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_brood_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"brood_frame_count\" IS NULL OR \"brood_frame_count\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_brood_pattern",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"brood_pattern\" IS NULL OR \"brood_pattern\" IN (\n    'COMPACT',\n    'SPOTTY',\n    'MOTTLED',\n    'OTHER'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_brood_quality_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"brood_quality\" IS NULL OR \"brood_quality\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_brood_stage",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"brood_stage\" IS NULL OR \"brood_stage\" IN (\n    'EGGS',\n    'LARVAE',\n    'CAPPED',\n    'MIXED'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_capped_brood_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"capped_brood_frame_count\" IS NULL OR \"capped_brood_frame_count\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_colony_strength_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"colony_strength\" IS NULL OR \"colony_strength\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_dead_bee_level_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"dead_bee_level\" IS NULL OR \"dead_bee_level\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_disease",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"disease\" IS NULL OR \"disease\" IN (\n    'AMERICAN_FOULBROOD',\n    'EUROPEAN_FOULBROOD',\n    'NOSEMA',\n    'CHALKBROOD',\n    'SACBROOD',\n    'DEFORMED_WING_VIRUS',\n    'OTHER'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_disease_other_consistency",
                schema: "hives",
                table: "hive_inspections",
                sql: "(\n    \"disease\" IS NULL\n    AND \"disease_other\" IS NULL\n) OR (\n    \"disease\" = 'OTHER'\n    AND \"disease_other\" IS NOT NULL\n    AND char_length(btrim(\"disease_other\")) BETWEEN 1 AND 100\n) OR (\n    \"disease\" IS NOT NULL\n    AND \"disease\" <> 'OTHER'\n    AND \"disease_other\" IS NULL\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_drone_brood_extent_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"drone_brood_extent\" IS NULL OR \"drone_brood_extent\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_drone_worker_balance_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"drone_worker_balance\" IS NULL OR \"drone_worker_balance\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_food_store_assessment_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"food_store_assessment\" IS NULL OR \"food_store_assessment\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_honey_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"honey_frame_count\" IS NULL OR \"honey_frame_count\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_honey_stores_rating_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"honey_stores_rating\" IS NULL OR \"honey_stores_rating\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_inspection_type",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"inspection_type\" IS NULL OR \"inspection_type\" IN (\n    'FIRST_SPRING',\n    'SPRING_ROUTINE',\n    'SWARM_CONTROL',\n    'FIRST_SUMMER',\n    'SUMMER_ROUTINE',\n    'POST_HARVEST',\n    'AUTUMN_ROUTINE',\n    'PRE_WINTER',\n    'QUEEN_CHECK',\n    'HEALTH_CHECK',\n    'EMERGENCY',\n    'OTHER'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_larvae_presence_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"larvae_presence\" IS NULL OR \"larvae_presence\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_odor_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"odor\" IS NULL OR \"odor\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_open_brood_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"open_brood_frame_count\" IS NULL OR \"open_brood_frame_count\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_overall_condition_rating_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"overall_condition_rating\" IS NULL OR \"overall_condition_rating\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_pest",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"pest\" IS NULL OR \"pest\" IN (\n    'VARROA_MITE',\n    'WAX_MOTH',\n    'SMALL_HIVE_BEETLE',\n    'BEE_LOUSE',\n    'ANTS',\n    'OTHER'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_pest_other_consistency",
                schema: "hives",
                table: "hive_inspections",
                sql: "(\n    \"pest\" IS NULL\n    AND \"pest_other\" IS NULL\n) OR (\n    \"pest\" = 'OTHER'\n    AND \"pest_other\" IS NOT NULL\n    AND char_length(btrim(\"pest_other\")) BETWEEN 1 AND 100\n) OR (\n    \"pest\" IS NOT NULL\n    AND \"pest\" <> 'OTHER'\n    AND \"pest_other\" IS NULL\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_pollen_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"pollen_frame_count\" IS NULL OR \"pollen_frame_count\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_pollen_store_assessment_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"pollen_store_assessment\" IS NULL OR \"pollen_store_assessment\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_pollen_stores_rating_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"pollen_stores_rating\" IS NULL OR \"pollen_stores_rating\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_population_rating_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"population_rating\" IS NULL OR \"population_rating\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_predator",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"predator\" IS NULL OR \"predator\" IN (\n    'WASP',\n    'HORNET',\n    'MOUSE',\n    'BIRD',\n    'OTHER'\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_predator_other_consistency",
                schema: "hives",
                table: "hive_inspections",
                sql: "(\n    \"predator\" IS NULL\n    AND \"predator_other\" IS NULL\n) OR (\n    \"predator\" = 'OTHER'\n    AND \"predator_other\" IS NOT NULL\n    AND char_length(btrim(\"predator_other\")) BETWEEN 1 AND 100\n) OR (\n    \"predator\" IS NOT NULL\n    AND \"predator\" <> 'OTHER'\n    AND \"predator_other\" IS NULL\n)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_queen_cell_count_non_negative",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"queen_cell_count\" IS NULL OR \"queen_cell_count\" >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_queen_cell_stage_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"queen_cell_stage\" IS NULL OR \"queen_cell_stage\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_starvation_risk_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"starvation_risk\" IS NULL OR \"starvation_risk\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_swarming_tendency_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"swarming_tendency\" IS NULL OR \"swarming_tendency\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_temperament_rating_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"temperament_rating\" IS NULL OR \"temperament_rating\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "ck_hive_inspections_varroa_level_range",
                schema: "hives",
                table: "hive_inspections",
                sql: "\"varroa_level\" IS NULL OR \"varroa_level\" BETWEEN 1 AND 5");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_bee_covered_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_brood_coverage_percentage_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_brood_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_brood_pattern",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_brood_quality_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_brood_stage",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_capped_brood_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_colony_strength_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_dead_bee_level_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_disease",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_disease_other_consistency",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_drone_brood_extent_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_drone_worker_balance_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_food_store_assessment_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_honey_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_honey_stores_rating_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_inspection_type",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_larvae_presence_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_odor_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_open_brood_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_overall_condition_rating_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_pest",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_pest_other_consistency",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_pollen_frame_count_non_negative",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_pollen_store_assessment_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_pollen_stores_rating_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_population_rating_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_predator",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_predator_other_consistency",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_queen_cell_count_non_negative",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_queen_cell_stage_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_starvation_risk_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_swarming_tendency_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_temperament_rating_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropCheckConstraint(
                name: "ck_hive_inspections_varroa_level_range",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "bee_covered_frame_count",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "brood_coverage_percentage",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "brood_frame_count",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "brood_pattern",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "brood_quality",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "brood_stage",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "capped_brood_frame_count",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "colony_strength",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "dead_bee_level",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "disease",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "disease_other",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "drone_brood_extent",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "drone_brood_present",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "drone_worker_balance",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "excess_moisture_present",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "food_store_assessment",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "has_swarmed",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "honey_frame_count",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "honey_stores_rating",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "inspection_type",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "larvae_presence",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "mold_present",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "odor",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "open_brood_frame_count",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "overall_condition_rating",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "pest",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "pest_other",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "pollen_frame_count",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "pollen_store_assessment",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "pollen_stores_rating",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "population_rating",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "predator",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "predator_other",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "queen_cell_count",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "queen_cell_stage",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "queen_marked",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "queen_seen",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "starvation_risk",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "swarming_tendency",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "temperament_rating",
                schema: "hives",
                table: "hive_inspections");

            migrationBuilder.DropColumn(
                name: "varroa_level",
                schema: "hives",
                table: "hive_inspections");
        }
    }
}
