export const varroaApplicationMethods = [
  'strips',
  'fumigation',
  'trickling',
  'vaporization',
  'spraying',
  'other',
] as const;

export const varroaDoseUnits = ['ml', 'strips', 'g'] as const;

export type VarroaApplicationMethod = (typeof varroaApplicationMethods)[number];

export type VarroaDoseUnit = (typeof varroaDoseUnits)[number];

export type RecordVarroaTreatmentRequest = {
  performedAt: string;
  productName: string;
  applicationMethod: VarroaApplicationMethod;
  doseAmount: number;
  doseUnit: VarroaDoseUnit;
  imageUrl: string | null;
  notes: string | null;
  hiveIds: string[];
};

export type RecordVarroaTreatmentResponse = {
  actionGroupId: string | null;
  affectedHiveCount: number;
  productName: string;
  applicationMethod: VarroaApplicationMethod;
  doseAmount: number;
  doseUnit: VarroaDoseUnit;
  totalDoseAmount: number;
};

export type VarroaTreatmentDetails = {
  id: string;
  hiveId: string;
  performedAt: string;
  actionGroupId: string | null;
  productName: string;
  applicationMethod: VarroaApplicationMethod;
  doseAmount: number;
  doseUnit: VarroaDoseUnit;
  imageUrl: string | null;
  notes: string | null;
};
