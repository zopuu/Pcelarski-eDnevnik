import type {
  RelocationKind,
  RelocationTransportMethod,
} from './create-relocation';

export type ApiaryRelocationHistoryItem = {
  id: string;
  kind: RelocationKind;
  occurredAtUtc: string;
  originLocationName: string;
  destinationLocationName: string;
  hiveCount: number | null;
  transportMethod: RelocationTransportMethod;
  distanceKm: number | null;
  notes: string | null;
};

export type ApiaryRelocationsPage = {
  items: ApiaryRelocationHistoryItem[];
  page: number;
  hasNextPage: boolean;
};
