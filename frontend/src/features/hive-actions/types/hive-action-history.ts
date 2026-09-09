import type { HiveInspectionType } from '@/features/hive-inspections/types/hive-inspection';
import type { PattyType } from '@/features/patty-feedings/types/patty-feeding';
import type {
  VarroaApplicationMethod,
  VarroaDoseUnit,
} from '@/features/varroa-treatments/types/varroa-treatment';

export type HiveActionType =
  | 'inspection'
  | 'varroaTreatment'
  | 'syrupFeeding'
  | 'pattyFeeding'
  | 'honeyFrameFeeding'
  | 'insulation'
  | 'maintenance'
  | 'superManagement';

type HiveActionHistoryItemBase = {
  id: string;
  performedAt: string;
};

export type HiveActionHistoryItem =
  | (HiveActionHistoryItemBase & {
      type: 'inspection';
      summary: {
        $summaryType: 'inspection';
        inspectionType: HiveInspectionType | null;
        overallConditionRating: number | null;
        hasHealthIssue: boolean;
      };
    })
  | (HiveActionHistoryItemBase & {
      type: 'varroaTreatment';
      summary: {
        $summaryType: 'varroaTreatment';
        productName: string;
        applicationMethod: VarroaApplicationMethod;
        doseAmount: number;
        doseUnit: VarroaDoseUnit;
      };
    })
  | (HiveActionHistoryItemBase & {
      type: 'syrupFeeding';
      summary: {
        $summaryType: 'syrupFeeding';
        quantityMl: number;
        sugarParts: number;
        waterParts: number;
      };
    })
  | (HiveActionHistoryItemBase & {
      type: 'pattyFeeding';
      summary: {
        $summaryType: 'pattyFeeding';
        massG: number;
        pattyType: PattyType;
        manufacturer: string | null;
      };
    })
  | (HiveActionHistoryItemBase & {
      type: 'honeyFrameFeeding';
      summary: {
        $summaryType: 'honeyFrameFeeding';
        frameCount: number;
        frameSource: string | null;
      };
    })
  | (HiveActionHistoryItemBase & {
      type: 'insulation';
      summary: {
        $summaryType: 'insulation';
        operation: string;
        paper: boolean;
        eps: boolean;
        xps: boolean;
      };
    })
  | (HiveActionHistoryItemBase & {
      type: 'maintenance';
      summary: {
        $summaryType: 'maintenance';
        maintenanceType: string;
        costAmount: number | null;
        currencyCode: string | null;
        serviceProvider: string | null;
      };
    })
  | (HiveActionHistoryItemBase & {
      type: 'superManagement';
      summary: {
        $summaryType: 'superManagement';
      };
    });

export type HiveActionHistoryPage = {
  items: HiveActionHistoryItem[];
  nextCursor: string | null;
};
