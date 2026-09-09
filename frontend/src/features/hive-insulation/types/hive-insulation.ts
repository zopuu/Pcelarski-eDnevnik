export type HiveInsulationOperation = 'add' | 'remove';

export type HiveInsulationState = {
  paper: boolean;
  eps: boolean;
  xps: boolean;
};

export type RecordHiveInsulationHive = {
  hiveId: string;
  paper: boolean;
  eps: boolean;
  xps: boolean;
};

export type RecordHiveInsulationRequest = {
  performedAt: string;
  operation: HiveInsulationOperation;
  imageUrl: string | null;
  notes: string | null;
  hives: RecordHiveInsulationHive[];
};

export type RecordHiveInsulationResponse = {
  actionGroupId: string | null;
  actions: {
    actionId: string;
    hiveId: string;
  }[];
};

export type HiveInsulationDetails = {
  id: string;
  hiveId: string;
  performedAt: string;
  actionGroupId: string | null;
  operation: HiveInsulationOperation;
  paper: boolean;
  eps: boolean;
  xps: boolean;
  imageUrl: string | null;
  notes: string | null;
};
