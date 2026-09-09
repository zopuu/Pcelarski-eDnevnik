import type {
  VarroaApplicationMethod,
  VarroaDoseUnit,
} from '@/features/varroa-treatments/types/varroa-treatment';
import type { HiveInspectionType } from '@/features/hive-inspections/types/hive-inspection';

export type HiveActionHistoryKind =
  | 'inspection'
  | 'varroaTreatment'
  | 'syrupFeeding';

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
};

export type HiveActionHistoryPage = {
  items: HiveActionHistoryItem[];
  page: number;
  hasNextPage: boolean;
};
