import type {
  BroodPattern,
  BroodStage,
  HiveDisease,
  HiveInspectionType,
  HivePest,
  HivePredator,
} from '../types/hive-inspection';

const inspectionTypeLabels: Record<HiveInspectionType, string> = {
  FIRST_SPRING: 'Prvi prolećni',
  SPRING_ROUTINE: 'Prolećni redovni',
  SWARM_CONTROL: 'Kontrola rojenja',
  FIRST_SUMMER: 'Prvi letnji',
  SUMMER_ROUTINE: 'Letnji redovni',
  POST_HARVEST: 'Nakon vrcanja',
  AUTUMN_ROUTINE: 'Jesenji redovni',
  PRE_WINTER: 'Predzimni',
  QUEEN_CHECK: 'Pregled matice',
  HEALTH_CHECK: 'Zdravstveni pregled',
  EMERGENCY: 'Vanredni',
  OTHER: 'Drugi pregled',
};

const broodPatternLabels: Record<BroodPattern, string> = {
  COMPACT: 'Kompaktan',
  SPOTTY: 'Raspršen',
  MOTTLED: 'Neujednačen',
  OTHER: 'Drugo',
};

const broodStageLabels: Record<BroodStage, string> = {
  EGGS: 'Jaja',
  LARVAE: 'Larve',
  CAPPED: 'Poklopljeno',
  MIXED: 'Mešovito',
};

const diseaseLabels: Record<HiveDisease, string> = {
  AMERICAN_FOULBROOD: 'Američka kuga legla',
  EUROPEAN_FOULBROOD: 'Evropska kuga legla',
  NOSEMA: 'Nozemoza',
  CHALKBROOD: 'Krečno leglo',
  SACBROOD: 'Kesasto leglo',
  DEFORMED_WING_VIRUS: 'Virus deformisanih krila',
  OTHER: 'Druga bolest',
};

const pestLabels: Record<HivePest, string> = {
  VARROA_MITE: 'Varoa',
  WAX_MOTH: 'Voštani moljac',
  SMALL_HIVE_BEETLE: 'Mala košničina buba',
  BEE_LOUSE: 'Pčelinja vaš',
  ANTS: 'Mravi',
  OTHER: 'Druga štetočina',
};

const predatorLabels: Record<HivePredator, string> = {
  WASP: 'Osa',
  HORNET: 'Stršljen',
  MOUSE: 'Miš',
  BIRD: 'Ptica',
  OTHER: 'Drugi predator',
};

export function getInspectionTypeLabel(value: HiveInspectionType | null) {
  return value ? inspectionTypeLabels[value] : 'Pregled košnice';
}

export function getBroodPatternLabel(value: BroodPattern) {
  return broodPatternLabels[value];
}

export function getBroodStageLabel(value: BroodStage) {
  return broodStageLabels[value];
}

export function getDiseaseLabel(value: HiveDisease) {
  return diseaseLabels[value];
}

export function getPestLabel(value: HivePest) {
  return pestLabels[value];
}

export function getPredatorLabel(value: HivePredator) {
  return predatorLabels[value];
}
