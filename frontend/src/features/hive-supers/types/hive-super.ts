import type { HiveType } from '@/features/hives/types/hive';

export type HiveSuperStatus = 'onHive' | 'readyForHarvest' | 'archived';

export type HiveSuperOperation =
  | 'removeForHarvest'
  | 'removeAndArchive';

export type HiveSuper = {
  id: string;
  type: HiveType;
  frameCount: number;
  status: HiveSuperStatus;
  colorHex: string | null;
  stayId: string;
  startedOn: string;
};

export type AddHiveSupersRequest = {
  supers: Array<{
    frameCount: number;
    colorHex: string;
  }>;
};

export type AddHiveSupersResponse = {
  superManagementId: string;
  hiveId: string;
  addedSupersCount: number;
  supers: Array<{
    hiveSuperId: string;
    hiveSuperStayId: string;
    type: HiveType;
    status: HiveSuperStatus;
    frameCount: number;
    colorHex: string;
  }>;
};

export type RemoveHiveSupersRequest = {
  items: Array<{
    hiveSuperId: string;
    operation: HiveSuperOperation;
    harvestableFrameCount: number | null;
  }>;
};

export type RemoveHiveSupersResponse = {
  superManagementId: string;
  hiveId: string;
  supers: Array<{
    hiveSuperId: string;
    hiveSuperStayId: string;
    operation: HiveSuperOperation;
    status: HiveSuperStatus;
    harvestableFrameCount: number | null;
  }>;
};
