import type {
  VarroaApplicationMethod,
  VarroaDoseUnit,
} from '@/features/varroa-treatments/types/varroa-treatment';
import type { HiveInspectionType } from '@/features/hive-inspections/types/hive-inspection';
import type { PattyType } from '@/features/patty-feedings/types/patty-feeding';

export type HiveActionHistoryKind =
  'inspection' | 'varroaTreatment' | 'syrupFeeding' | 'pattyFeeding';

export type HiveActionHistoryItem = {
  id: string;
  performedAt: string;
  kind: HiveActionHistoryKind;
  inspectionType: HiveInspectionType | null;
  overallConditionRating: number | null;
  hasHealthIssue: boolean | null;
  productName: string | null;
  applicationMethod: VarroaApplicationMethod | null;
  doseAmount: number | null;
  doseUnit: VarroaDoseUnit | null;
  quantityMl: number | null;
  sugarParts: number | null;
  waterParts: number | null;
  massG: number | null;
  pattyType: PattyType | null;
  manufacturer: string | null;
};

export type HiveActionHistoryPage = {
  items: HiveActionHistoryItem[];
  page: number;
  hasNextPage: boolean;
};
