export const pattyTypes = [
  'sugar',
  'protein',
  'honey',
  'medicated',
  'invertSugar',
  'other',
] as const;

export type PattyType = (typeof pattyTypes)[number];

export type RecordPattyFeedingRequest = {
  performedAt: string;
  pattyMassG: number;
  pattyType: PattyType;
  manufacturer: string | null;
  notes: string | null;
  imageUrl: string | null;
  hives: {
    hiveId: string;
    percentage: number;
  }[];
};

export type RecordPattyFeedingResponse = {
  actionGroupId: string | null;
  affectedHiveCount: number;
  totalMassG: number;
};

export type PattyFeedingDetails = {
  id: string;
  hiveId: string;
  performedAt: string;
  actionGroupId: string | null;
  massG: number;
  pattyType: PattyType;
  manufacturer: string | null;
  imageUrl: string | null;
  notes: string | null;
};
