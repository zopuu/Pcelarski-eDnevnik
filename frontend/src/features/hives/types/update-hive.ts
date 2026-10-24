import type { HiveMaterial, HiveType } from './hive';
import type { HiveDetails } from './hive-details';

export type UpdateHiveRequest = {
  label: string;
  identificationNumber: string | null;
  type: HiveType;
  colorHex: string | null;
  manufactureDate: string | null;
  manufacturer: string | null;
  material: HiveMaterial | null;
  purchaseDate: string | null;
  hasFeeder: boolean;
  feederVolumeMl: number | null;
  note: string | null;
};

export type UpdateHiveResponse = HiveDetails;
