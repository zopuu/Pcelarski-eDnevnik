import type {
  HiveMaterial,
  HiveStatus,
  HiveType,
} from './hive';

export type HiveDetails = {
  id: string;

  identificationNumber:
    | string
    | null;

  label: string;

  type: HiveType;

  colorHex:
    | string
    | null;

  status: HiveStatus;

  manufactureDate:
    | string
    | null;

  manufacturer:
    | string
    | null;

  material:
    | HiveMaterial
    | null;

  purchaseDate:
    | string
    | null;

  hasFeeder: boolean;

  feederVolumeMl:
    | number
    | null;

  note:
    | string
    | null;

  createdAtUtc: string;

  updatedAtUtc:
    | string
    | null;
};