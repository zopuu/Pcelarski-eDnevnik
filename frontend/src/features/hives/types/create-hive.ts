import type { HiveMaterial, HiveStatus, HiveType } from './hive';

export type CreateHiveRequest = {
  identificationNumber: string | null;

  label: string;

  type: HiveType;

  colorHex: string | null;

  manufactureDate: string | null;

  manufacturer: string | null;

  material: HiveMaterial | null;

  purchaseDate: string | null;
};

export type CreateHiveResponse = {
  id: string;

  identificationNumber: string | null;

  label: string;

  type: HiveType;

  status: HiveStatus;

  hasFeeder: boolean;

  currentApiaryId: string;

  activeStayId: string;

  stayStartedAtUtc: string;

  createdAtUtc: string;
};
