export type RecordHoneyFrameFeedingRequest = {
  performedAt: string;
  frameSource: string | null;
  notes: string | null;
  imageUrl: string | null;
  hives: {
    hiveId: string;
    frameCount: number;
  }[];
};

export type RecordHoneyFrameFeedingResponse = {
  actionGroupId: string | null;
  affectedHiveCount: number;
  totalFrameCount: number;
};

export type HoneyFrameFeedingDetails = {
  id: string;
  hiveId: string;
  performedAt: string;
  actionGroupId: string | null;
  frameCount: number;
  frameSource: string | null;
  imageUrl: string | null;
  notes: string | null;
};
