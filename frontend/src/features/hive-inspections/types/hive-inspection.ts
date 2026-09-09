export const hiveInspectionTypes = [
  "FIRST_SPRING",
  "SPRING_ROUTINE",
  "SWARM_CONTROL",
  "FIRST_SUMMER",
  "SUMMER_ROUTINE",
  "POST_HARVEST",
  "AUTUMN_ROUTINE",
  "PRE_WINTER",
  "QUEEN_CHECK",
  "HEALTH_CHECK",
  "EMERGENCY",
  "OTHER",
] as const;

export const broodPatterns = ["COMPACT", "SPOTTY", "MOTTLED", "OTHER"] as const;

export const broodStages = ["EGGS", "LARVAE", "CAPPED", "MIXED"] as const;

export const hiveDiseases = [
  "AMERICAN_FOULBROOD",
  "EUROPEAN_FOULBROOD",
  "NOSEMA",
  "CHALKBROOD",
  "SACBROOD",
  "DEFORMED_WING_VIRUS",
  "OTHER",
] as const;

export const hivePests = [
  "VARROA_MITE",
  "WAX_MOTH",
  "SMALL_HIVE_BEETLE",
  "BEE_LOUSE",
  "ANTS",
  "OTHER",
] as const;

export const hivePredators = [
  "WASP",
  "HORNET",
  "MOUSE",
  "BIRD",
  "OTHER",
] as const;

export type HiveInspectionType = (typeof hiveInspectionTypes)[number];
export type BroodPattern = (typeof broodPatterns)[number];
export type BroodStage = (typeof broodStages)[number];
export type HiveDisease = (typeof hiveDiseases)[number];
export type HivePest = (typeof hivePests)[number];
export type HivePredator = (typeof hivePredators)[number];

export type RecordHiveInspectionRequest = {
  performedAt: string;
  inspectionType: HiveInspectionType | null;
  overallConditionRating: number | null;
  populationRating: number | null;
  temperamentRating: number | null;
  colonyStrength: number | null;
  beeCoveredFrameCount: number | null;
  broodFrameCount: number | null;
  honeyFrameCount: number | null;
  pollenFrameCount: number | null;
  hasSwarmed: boolean | null;
  honeyStoresRating: number | null;
  pollenStoresRating: number | null;
  broodCoveragePercentage: number | null;
  openBroodFrameCount: number | null;
  cappedBroodFrameCount: number | null;
  broodPattern: BroodPattern | null;
  broodStage: BroodStage | null;
  droneBroodPresent: boolean | null;
  droneBroodExtent: number | null;
  larvaePresence: number | null;
  droneWorkerBalance: number | null;
  broodQuality: number | null;
  queenSeen: boolean | null;
  queenMarked: boolean | null;
  queenCellCount: number | null;
  queenCellStage: number | null;
  swarmingTendency: number | null;
  foodStoreAssessment: number | null;
  pollenStoreAssessment: number | null;
  starvationRisk: number | null;
  varroaLevel: number | null;
  disease: HiveDisease | null;
  diseaseOther: string | null;
  pest: HivePest | null;
  pestOther: string | null;
  predator: HivePredator | null;
  predatorOther: string | null;
  moldPresent: boolean | null;
  excessMoisturePresent: boolean | null;
  deadBeeLevel: number | null;
  odor: number | null;
  imageUrl: string | null;
  notes: string | null;
};

export type RecordHiveInspectionResponse = {
  actionId: string;
  hiveId: string;
  performedAt: string;
  inspectionType: string | null;
};
