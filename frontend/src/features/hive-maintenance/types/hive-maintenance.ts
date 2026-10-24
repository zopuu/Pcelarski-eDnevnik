export const hiveMaintenanceTypes = [
  'PAINTING',
  'FLOOR_REPAIR',
  'LID_REPLACEMENT',
  'ENTRANCE_REPLACEMENT',
  'VARROA_SCREEN_INSTALLATION',
  'DISINFECTION',
  'REPAIR',
  'OTHER',
] as const;

export type HiveMaintenanceType = (typeof hiveMaintenanceTypes)[number];

export type RecordHiveMaintenanceRequest = {
  hiveId: string;
  performedAt: string;
  maintenanceType: HiveMaintenanceType;
  costAmount: number | null;
  currencyCode: string | null;
  serviceProvider: string | null;
  imageUrl: string | null;
  notes: string | null;
};

export type RecordHiveMaintenanceResponse = {
  actionId: string;
  hiveId: string;
  maintenanceType: HiveMaintenanceType;
  costAmount: number | null;
  currencyCode: string | null;
  serviceProvider: string | null;
  hiveStatus: string;
};

export type HiveMaintenanceDetails = RecordHiveMaintenanceRequest & {
  id: string;
};
