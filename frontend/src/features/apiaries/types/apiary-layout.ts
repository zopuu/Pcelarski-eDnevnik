export type ApiaryLayoutHive = {
  id: string;
  label: string;
  colorHex: string | null;
  hiveType: string;
  x: number | null;
  y: number | null;
};

export type ApiaryLayoutResponse = {
  layoutId: string;
  apiaryStayId: string;
  version: number;
  hives: ApiaryLayoutHive[];
};

export type ApiaryLayoutPosition = {
  hiveId: string;
  x: number;
  y: number;
};

export type ReplaceApiaryLayoutRequest = {
  expectedApiaryStayId: string;
  expectedVersion: number;
  positions: ApiaryLayoutPosition[];
};

export type ReplaceApiaryLayoutResponse = {
  layoutId: string;
  apiaryStayId: string;
  version: number;
  positions: ApiaryLayoutPosition[];
};

export type ApiaryLayoutCollisionViolation = {
  hiveId: string;
  conflictingHiveId: string;
};
