import type { HiveStatus, HiveType } from './hive';

export type HiveListItem = {
  id: string;

  identificationNumber: string | null;

  label: string;

  type: HiveType;

  colorHex: string | null;

  status: HiveStatus;
};
