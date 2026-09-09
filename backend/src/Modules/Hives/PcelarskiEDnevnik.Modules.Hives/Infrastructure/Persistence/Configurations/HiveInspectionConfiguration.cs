using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PcelarskiEDnevnik.Modules.Hives.Domain.HiveActions;

namespace PcelarskiEDnevnik.Modules.Hives.Infrastructure.Persistence.Configurations;

internal sealed class HiveInspectionConfiguration
    : IEntityTypeConfiguration<HiveInspection> {
    private static readonly string[] RatingColumns = [
        "overall_condition_rating",
        "population_rating",
        "temperament_rating",
        "colony_strength",
        "honey_stores_rating",
        "pollen_stores_rating",
        "drone_brood_extent",
        "larvae_presence",
        "drone_worker_balance",
        "brood_quality",
        "queen_cell_stage",
        "swarming_tendency",
        "food_store_assessment",
        "pollen_store_assessment",
        "starvation_risk",
        "varroa_level",
        "dead_bee_level",
        "odor"
    ];

    private static readonly string[] CountColumns = [
        "bee_covered_frame_count",
        "brood_frame_count",
        "honey_frame_count",
        "pollen_frame_count",
        "open_brood_frame_count",
        "capped_brood_frame_count",
        "queen_cell_count"
    ];

    public void Configure(
        EntityTypeBuilder<HiveInspection> builder) {
        builder.ToTable(
            "hive_inspections",
            "hives",
            table => {
                table.HasCheckConstraint(
                    "ck_hive_inspections_inspection_type",
                    """
                    "inspection_type" IS NULL OR "inspection_type" IN (
                        'FIRST_SPRING',
                        'SPRING_ROUTINE',
                        'SWARM_CONTROL',
                        'FIRST_SUMMER',
                        'SUMMER_ROUTINE',
                        'POST_HARVEST',
                        'AUTUMN_ROUTINE',
                        'PRE_WINTER',
                        'QUEEN_CHECK',
                        'HEALTH_CHECK',
                        'EMERGENCY',
                        'OTHER'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_inspections_brood_pattern",
                    """
                    "brood_pattern" IS NULL OR "brood_pattern" IN (
                        'COMPACT',
                        'SPOTTY',
                        'MOTTLED',
                        'OTHER'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_inspections_brood_stage",
                    """
                    "brood_stage" IS NULL OR "brood_stage" IN (
                        'EGGS',
                        'LARVAE',
                        'CAPPED',
                        'MIXED'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_inspections_disease",
                    """
                    "disease" IS NULL OR "disease" IN (
                        'AMERICAN_FOULBROOD',
                        'EUROPEAN_FOULBROOD',
                        'NOSEMA',
                        'CHALKBROOD',
                        'SACBROOD',
                        'DEFORMED_WING_VIRUS',
                        'OTHER'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_inspections_pest",
                    """
                    "pest" IS NULL OR "pest" IN (
                        'VARROA_MITE',
                        'WAX_MOTH',
                        'SMALL_HIVE_BEETLE',
                        'BEE_LOUSE',
                        'ANTS',
                        'OTHER'
                    )
                    """);

                table.HasCheckConstraint(
                    "ck_hive_inspections_predator",
                    """
                    "predator" IS NULL OR "predator" IN (
                        'WASP',
                        'HORNET',
                        'MOUSE',
                        'BIRD',
                        'OTHER'
                    )
                    """);

                AddOtherDetailConstraint(table, "disease", "disease_other");
                AddOtherDetailConstraint(table, "pest", "pest_other");
                AddOtherDetailConstraint(table, "predator", "predator_other");

                foreach (var columnName in RatingColumns) {
                    table.HasCheckConstraint(
                        $"ck_hive_inspections_{columnName}_range",
                        $"\"{columnName}\" IS NULL OR \"{columnName}\" BETWEEN {HiveInspectionRules.MinimumRating} AND {HiveInspectionRules.MaximumRating}");
                }

                foreach (var columnName in CountColumns) {
                    table.HasCheckConstraint(
                        $"ck_hive_inspections_{columnName}_non_negative",
                        $"\"{columnName}\" IS NULL OR \"{columnName}\" >= {HiveInspectionRules.MinimumCount}");
                }

                table.HasCheckConstraint(
                    "ck_hive_inspections_brood_coverage_percentage_range",
                    $"\"brood_coverage_percentage\" IS NULL OR \"brood_coverage_percentage\" BETWEEN {HiveInspectionRules.MinimumBroodCoveragePercentage} AND {HiveInspectionRules.MaximumBroodCoveragePercentage}");

                table.Property(
                        x => x.Id)
                    .HasColumnName(
                        "action_id");
            });

        ConfigureNullableEnum(
            builder.Property(x => x.InspectionType),
            "inspection_type",
            HiveInspectionRules.InspectionTypeMaxLength);

        ConfigureNullableSmallint(builder.Property(x => x.OverallConditionRating), "overall_condition_rating");
        ConfigureNullableSmallint(builder.Property(x => x.PopulationRating), "population_rating");
        ConfigureNullableSmallint(builder.Property(x => x.TemperamentRating), "temperament_rating");
        ConfigureNullableSmallint(builder.Property(x => x.ColonyStrength), "colony_strength");
        ConfigureNullableSmallint(builder.Property(x => x.BeeCoveredFrameCount), "bee_covered_frame_count");
        ConfigureNullableSmallint(builder.Property(x => x.BroodFrameCount), "brood_frame_count");
        ConfigureNullableSmallint(builder.Property(x => x.HoneyFrameCount), "honey_frame_count");
        ConfigureNullableSmallint(builder.Property(x => x.PollenFrameCount), "pollen_frame_count");
        ConfigureNullableBoolean(builder.Property(x => x.HasSwarmed), "has_swarmed");
        ConfigureNullableSmallint(builder.Property(x => x.HoneyStoresRating), "honey_stores_rating");
        ConfigureNullableSmallint(builder.Property(x => x.PollenStoresRating), "pollen_stores_rating");

        builder.Property(x => x.BroodCoveragePercentage)
            .HasColumnName("brood_coverage_percentage")
            .HasColumnType("integer")
            .IsRequired(false);

        ConfigureNullableSmallint(builder.Property(x => x.OpenBroodFrameCount), "open_brood_frame_count");
        ConfigureNullableSmallint(builder.Property(x => x.CappedBroodFrameCount), "capped_brood_frame_count");
        ConfigureNullableEnum(
            builder.Property(x => x.BroodPattern),
            "brood_pattern",
            HiveInspectionRules.BroodPatternMaxLength);
        ConfigureNullableEnum(
            builder.Property(x => x.BroodStage),
            "brood_stage",
            HiveInspectionRules.BroodStageMaxLength);
        ConfigureNullableBoolean(builder.Property(x => x.DroneBroodPresent), "drone_brood_present");
        ConfigureNullableSmallint(builder.Property(x => x.DroneBroodExtent), "drone_brood_extent");
        ConfigureNullableSmallint(builder.Property(x => x.LarvaePresence), "larvae_presence");
        ConfigureNullableSmallint(builder.Property(x => x.DroneWorkerBalance), "drone_worker_balance");
        ConfigureNullableSmallint(builder.Property(x => x.BroodQuality), "brood_quality");
        ConfigureNullableBoolean(builder.Property(x => x.QueenSeen), "queen_seen");
        ConfigureNullableBoolean(builder.Property(x => x.QueenMarked), "queen_marked");
        ConfigureNullableSmallint(builder.Property(x => x.QueenCellCount), "queen_cell_count");
        ConfigureNullableSmallint(builder.Property(x => x.QueenCellStage), "queen_cell_stage");
        ConfigureNullableSmallint(builder.Property(x => x.SwarmingTendency), "swarming_tendency");
        ConfigureNullableSmallint(builder.Property(x => x.FoodStoreAssessment), "food_store_assessment");
        ConfigureNullableSmallint(builder.Property(x => x.PollenStoreAssessment), "pollen_store_assessment");
        ConfigureNullableSmallint(builder.Property(x => x.StarvationRisk), "starvation_risk");
        ConfigureNullableSmallint(builder.Property(x => x.VarroaLevel), "varroa_level");
        ConfigureNullableEnum(
            builder.Property(x => x.Disease),
            "disease",
            HiveInspectionRules.HealthFindingMaxLength);
        ConfigureOtherDetail(builder.Property(x => x.DiseaseOther), "disease_other");
        ConfigureNullableEnum(
            builder.Property(x => x.Pest),
            "pest",
            HiveInspectionRules.HealthFindingMaxLength);
        ConfigureOtherDetail(builder.Property(x => x.PestOther), "pest_other");
        ConfigureNullableEnum(
            builder.Property(x => x.Predator),
            "predator",
            HiveInspectionRules.HealthFindingMaxLength);
        ConfigureOtherDetail(builder.Property(x => x.PredatorOther), "predator_other");
        ConfigureNullableBoolean(builder.Property(x => x.MoldPresent), "mold_present");
        ConfigureNullableBoolean(builder.Property(x => x.ExcessMoisturePresent), "excess_moisture_present");
        ConfigureNullableSmallint(builder.Property(x => x.DeadBeeLevel), "dead_bee_level");
        ConfigureNullableSmallint(builder.Property(x => x.Odor), "odor");
    }

    private static void AddOtherDetailConstraint(
        TableBuilder<HiveInspection> table,
        string selectionColumn,
        string detailColumn) {
        table.HasCheckConstraint(
            $"ck_hive_inspections_{selectionColumn}_other_consistency",
            $"""
            (
                "{selectionColumn}" IS NULL
                AND "{detailColumn}" IS NULL
            ) OR (
                "{selectionColumn}" = 'OTHER'
                AND "{detailColumn}" IS NOT NULL
                AND char_length(btrim("{detailColumn}")) BETWEEN 1 AND {HiveInspectionRules.OtherDetailMaxLength}
            ) OR (
                "{selectionColumn}" IS NOT NULL
                AND "{selectionColumn}" <> 'OTHER'
                AND "{detailColumn}" IS NULL
            )
            """);
    }

    private static void ConfigureNullableSmallint(
        PropertyBuilder<short?> property,
        string columnName) {
        property
            .HasColumnName(columnName)
            .HasColumnType("smallint")
            .IsRequired(false);
    }

    private static void ConfigureNullableBoolean(
        PropertyBuilder<bool?> property,
        string columnName) {
        property
            .HasColumnName(columnName)
            .HasColumnType("boolean")
            .IsRequired(false);
    }

    private static void ConfigureNullableEnum<TEnum>(
        PropertyBuilder<TEnum?> property,
        string columnName,
        int maxLength)
        where TEnum : struct, Enum {
        property
            .HasColumnName(columnName)
            .HasColumnType($"character varying({maxLength})")
            .HasConversion<string>()
            .HasMaxLength(maxLength)
            .IsRequired(false);
    }

    private static void ConfigureOtherDetail(
        PropertyBuilder<string?> property,
        string columnName) {
        property
            .HasColumnName(columnName)
            .HasColumnType("character varying(100)")
            .HasMaxLength(HiveInspectionRules.OtherDetailMaxLength)
            .IsRequired(false);
    }
}
