import type { HiveStatus, HiveType } from '@/features/hives/types/hive';

export type TransferDestinationHive = {
  id: string;
  label: string;
  identificationNumber: string | null;
  type: HiveType;
  colorHex: string | null;
  status: HiveStatus;
};

export type TransferColonyRequest = {
  destinationHiveId: string;
  transferredOn: string;
};

export type TransferColonyResponse = {
  colonyId: string;
  sourceHiveId: string;
  destinationHiveId: string;
  closedColonyStayId: string;
  newColonyStayId: string;
  transferredOn: string;
};
