export type SyrupFeedingHiveOption = {
  hiveId: string;
  feederCapacityMl: number;
};

export type RecordSyrupFeedingRequest = {
  performedAt: string;
  sugarParts: number;
  waterParts: number;
  additives: string | null;
  notes: string | null;
  imageUrl: string | null;
  hives: {
    hiveId: string;
    fillPercentage: number;
  }[];
};

export type RecordSyrupFeedingResponse = {
  actionGroupId: string | null;
  affectedHiveCount: number;
  totalSyrupMl: number;
  estimatedSugarKg: number;
  estimatedWaterKg: number;
  actions: RecordedSyrupFeeding[];
};

export type RecordedSyrupFeeding = {
  actionId: string;
  hiveId: string;
  quantityMl: number;
};

export type SyrupFeedingDetails = {
  id: string;
  hiveId: string;
  performedAt: string;
  actionGroupId: string | null;
  quantityMl: number;
  sugarParts: number;
  waterParts: number;
  additives: string | null;
  imageUrl: string | null;
  notes: string | null;
};
